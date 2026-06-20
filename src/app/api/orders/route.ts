import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from '@/lib/get-session';
import { checkoutSchema } from '@/lib/validations';
import { generateOrderNumber, formatPrice } from '@/lib/utils';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { z } from 'zod';

const orderItemSchema = z.object({
  productId: z.string(),
  name:      z.string(),
  image:     z.string().nullable().optional(),
  price:     z.number(),
  quantity:  z.number().int().positive(),
});

const placeOrderSchema = checkoutSchema.and(
  z.object({ items: z.array(orderItemSchema).min(1) })
);

export async function POST(req: Request) {
  try {
    const session = await getServerSession();
    const body    = await req.json();
    const data    = placeOrderSchema.parse(body);

    // Load settings safely
    let deliveryFeeBase = 150;
    let freeDeliveryMin = 3000;
    try {
      const settings = await db.siteSettings.findUnique({
        where: { id: 'settings' },
      });
      if (settings) {
        deliveryFeeBase = settings.deliveryFee;
        freeDeliveryMin = settings.freeDeliveryMin;
      }
    } catch {
      // Use defaults if settings unavailable
    }

    const subtotal = data.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0
    );

    // Validate and apply coupon
    let discount:    number      = 0;
    let couponCode:  string|null = null;

    if (data.couponCode) {
      try {
        const coupon = await db.coupon.findUnique({
          where: { code: data.couponCode.toUpperCase() },
        });
        if (
          coupon &&
          coupon.isActive &&
          subtotal >= coupon.minOrderAmount
        ) {
          const notExpired =
            !coupon.expiresAt || coupon.expiresAt > new Date();
          const underLimit =
            !coupon.maxUses || coupon.usedCount < coupon.maxUses;

          if (notExpired && underLimit) {
            discount =
              coupon.type === 'PERCENTAGE'
                ? Math.round((subtotal * coupon.value) / 100)
                : coupon.value;
            discount   = Math.min(discount, subtotal);
            couponCode = coupon.code;

            await db.coupon.update({
              where: { id: coupon.id },
              data:  { usedCount: { increment: 1 } },
            });
          }
        }
      } catch {
        // Coupon validation failed — continue without discount
      }
    }

    const deliveryFee =
      data.deliveryType === 'pickup'
        ? 0
        : subtotal - discount >= freeDeliveryMin
        ? 0
        : deliveryFeeBase;

    const total = Math.max(0, subtotal - discount) + deliveryFee;

    // Create order — this must succeed before any side effects
    const order = await db.order.create({
      data: {
        orderNumber:   generateOrderNumber(),
        userId:        session?.id ?? null,
        customerName:  data.customerName.trim(),
        customerEmail: data.customerEmail.toLowerCase().trim(),
        customerPhone: data.customerPhone.trim(),
        deliveryType:  data.deliveryType,
        address:       data.address    ?? null,
        area:          data.area       ?? null,
        city:          data.city       ?? null,
        branch:        data.branch     ?? null,
        subtotal,
        discount,
        deliveryFee,
        total,
        couponCode,
        paymentMethod: data.paymentMethod,
        notes:         data.notes ?? null,
        status:        'PENDING',
        items: {
          create: data.items.map((i) => ({
            productId: i.productId || null,
            name:      i.name,
            image:     i.image    ?? null,
            price:     i.price,
            quantity:  i.quantity,
          })),
        },
      },
      include: { items: true },
    });

    // ── Fire-and-forget side effects ──
    // None of these block the 201 response

    // Admin notification
    db.notification
      .create({
        data: {
          type:  'ORDER',
          title: 'New Order: ' + order.orderNumber,
          body:  data.customerName + ' placed an order for ' + formatPrice(total),
          link:  '/admin/orders',
        },
      })
      .catch(() => {});

    // Stock deduction — fully parallel, never throws
    Promise.allSettled(
      data.items.map(async (item) => {
        try {
          const product = await db.product.findUnique({
            where:  { id: item.productId },
            select: { id: true, name: true, stock: true },
          });
          if (!product) return;

          const newStock = Math.max(0, product.stock - item.quantity);

          await db.product.update({
            where: { id: item.productId },
            data:  { stock: newStock },
          });

          if (newStock === 0) {
            db.notification
              .create({
                data: {
                  type:  'OUT_OF_STOCK',
                  title: 'Out of Stock: ' + product.name,
                  body:  'This product is now out of stock. Update inventory.',
                  link:  '/admin/products',
                },
              })
              .catch(() => {});
          } else if (newStock <= 5) {
            db.notification
              .create({
                data: {
                  type:  'LOW_STOCK',
                  title: 'Low Stock: ' + product.name,
                  body:  'Only ' + newStock + ' units remaining.',
                  link:  '/admin/products',
                },
              })
              .catch(() => {});
          }
        } catch {
          // Silent — stock failure never breaks order creation
        }
      })
    ).catch(() => {});

    // Confirmation email
    sendOrderConfirmationEmail({
      orderNumber:   order.orderNumber,
      customerName:  order.customerName,
      customerEmail: order.customerEmail,
      items: order.items.map((i) => ({
        name:     i.name,
        quantity: i.quantity,
        price:    i.price,
      })),
      subtotal:    order.subtotal,
      discount:    order.discount,
      deliveryFee: order.deliveryFee,
      total:       order.total,
      status:      'Pending',
    }).catch(() => {});

    return NextResponse.json(
      { orderNumber: order.orderNumber },
      { status: 201 }
    );
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json(
        { error: err.issues[0]?.message ?? 'Invalid order data' },
        { status: 400 }
      );
    }
    console.error('[orders POST] error:', err);
    return NextResponse.json(
      { error: 'Could not place order. Please try again.' },
      { status: 500 }
    );
  }
}