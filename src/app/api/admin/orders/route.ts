import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkoutSchema } from '@/lib/validations';
import { generateOrderNumber, formatPrice } from '@/lib/utils';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { z } from 'zod';

const orderItemSchema = z.object({
  productId: z.string(),
  name: z.string(),
  image: z.string().nullable().optional(),
  price: z.number(),
  quantity: z.number().int().positive(),
});

const placeOrderSchema = checkoutSchema.and(
  z.object({ items: z.array(orderItemSchema).min(1) })
);

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const data = placeOrderSchema.parse(body);

    const settings = await db.siteSettings.findUnique({ where: { id: 'settings' } });
    const deliveryFeeBase = settings?.deliveryFee ?? 150;
    const freeDeliveryMin = settings?.freeDeliveryMin ?? 3000;
    const subtotal = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    let discount = 0;
    let couponCode: string | null = null;
    if (data.couponCode) {
      const coupon = await db.coupon.findUnique({ where: { code: data.couponCode.toUpperCase() } });
      if (coupon && coupon.isActive && subtotal >= coupon.minOrderAmount) {
        const notExpired = !coupon.expiresAt || coupon.expiresAt > new Date();
        const underLimit = !coupon.maxUses || coupon.usedCount < coupon.maxUses;
        if (notExpired && underLimit) {
          discount = coupon.type === 'PERCENTAGE'
            ? Math.round((subtotal * coupon.value) / 100)
            : coupon.value;
          discount = Math.min(discount, subtotal);
          couponCode = coupon.code;
          await db.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }
    }

    const deliveryFee =
      data.deliveryType === 'pickup' ? 0
      : subtotal - discount >= freeDeliveryMin ? 0
      : deliveryFeeBase;
    const total = Math.max(0, subtotal - discount) + deliveryFee;

    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId: session?.user?.id ?? null,
        customerName: data.customerName,
        customerEmail: data.customerEmail.toLowerCase(),
        customerPhone: data.customerPhone,
        deliveryType: data.deliveryType,
        address: data.address ?? null,
        area: data.area ?? null,
        city: data.city ?? null,
        branch: data.branch ?? null,
        subtotal,
        discount,
        deliveryFee,
        total,
        couponCode,
        paymentMethod: data.paymentMethod,
        notes: data.notes ?? null,
        status: 'PENDING',
        items: {
          create: data.items.map((i) => ({
            productId: i.productId,
            name: i.name,
            image: i.image ?? null,
            price: i.price,
            quantity: i.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // Create admin notification
    db.notification.create({
      data: {
        type: 'ORDER',
        title: 'New Order: ' + order.orderNumber,
        body: data.customerName + ' placed an order for ' + formatPrice(total),
        link: '/admin/orders',
      },
    }).catch(() => {});

    // Check and create low-stock notifications
    for (const item of data.items) {
      const product = await db.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, stock: true },
      });
      if (product) {
        const newStock = product.stock - item.quantity;
        await db.product.update({
          where: { id: item.productId },
          data: { stock: Math.max(0, newStock) },
        });
        if (newStock <= 0) {
          db.notification.create({
            data: {
              type: 'OUT_OF_STOCK',
              title: 'Out of Stock: ' + product.name,
              body: 'This product is now out of stock. Update inventory.',
              link: '/admin/products',
            },
          }).catch(() => {});
        } else if (newStock <= 5) {
          db.notification.create({
            data: {
              type: 'LOW_STOCK',
              title: 'Low Stock: ' + product.name,
              body: 'Only ' + newStock + ' units remaining.',
              link: '/admin/products',
            },
          }).catch(() => {});
        }
      }
    }

    sendOrderConfirmationEmail({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      items: order.items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
      subtotal: order.subtotal,
      discount: order.discount,
      deliveryFee: order.deliveryFee,
      total: order.total,
      status: 'Pending',
    }).catch(() => {});

    return NextResponse.json({ orderNumber: order.orderNumber }, { status: 201 });
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ error: err.issues[0]?.message ?? 'Invalid data' }, { status: 400 });
    }
    console.error('[orders POST] error:', err);
    return NextResponse.json({ error: 'Could not place order. Please try again.' }, { status: 500 });
  }
}