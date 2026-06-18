import { Resend } from 'resend';
import { formatPrice } from '@/lib/utils';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM || 'Pink Pistachio <onboarding@resend.dev>';

interface OrderEmailItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderEmailPayload {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  items: OrderEmailItem[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  status: string;
}

function buildOrderTable(items: OrderEmailItem[]) {
  return items
    .map(
      (i) =>
        `<tr><td style="padding:8px 0;color:#3A2E2E;">${i.name} x${i.quantity}</td><td style="padding:8px 0;text-align:right;color:#3A2E2E;">${formatPrice(i.price * i.quantity)}</td></tr>`
    )
    .join('');
}

export async function sendOrderConfirmationEmail(payload: OrderEmailPayload) {
  if (!resend) {
    console.log('[email] RESEND_API_KEY not set — skipping order confirmation email');
    return;
  }

  const html = `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;background:#FFF8F0;padding:32px;border-radius:16px;">
    <h1 style="color:#CC3F78;font-size:24px;margin-bottom:4px;">Pink Pistachio</h1>
    <p style="color:#5A4A4A;margin-top:0;">Boutique Café &amp; Patisserie</p>
    <h2 style="color:#3A2E2E;font-size:18px;">Thank you for your order, ${payload.customerName}!</h2>
    <p style="color:#5A4A4A;">Your order <strong>${payload.orderNumber}</strong> has been received and is now <strong>${payload.status}</strong>.</p>
    <table style="width:100%;border-collapse:collapse;margin-top:16px;border-top:1px solid #FBC9DC;border-bottom:1px solid #FBC9DC;">
      ${buildOrderTable(payload.items)}
    </table>
    <table style="width:100%;margin-top:12px;color:#3A2E2E;">
      <tr><td>Subtotal</td><td style="text-align:right;">${formatPrice(payload.subtotal)}</td></tr>
      ${payload.discount > 0 ? `<tr><td>Discount</td><td style="text-align:right;">-${formatPrice(payload.discount)}</td></tr>` : ''}
      <tr><td>Delivery</td><td style="text-align:right;">${payload.deliveryFee === 0 ? 'Free' : formatPrice(payload.deliveryFee)}</td></tr>
      <tr><td style="font-weight:bold;padding-top:8px;">Total</td><td style="text-align:right;font-weight:bold;padding-top:8px;">${formatPrice(payload.total)}</td></tr>
    </table>
    <p style="margin-top:24px;color:#5A4A4A;font-size:14px;">We'll send you another email when your order status changes. You can also track it anytime using your order number.</p>
    <p style="margin-top:24px;color:#A8305F;font-size:14px;">With love,<br/>Pink Pistachio Team</p>
  </div>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: payload.customerEmail,
      subject: `Order Confirmed — ${payload.orderNumber} | Pink Pistachio`,
      html,
    });

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;
    if (adminEmail) {
      await resend.emails.send({
        from: FROM,
        to: adminEmail,
        subject: `New Order Received — ${payload.orderNumber}`,
        html: `<p>New order from ${payload.customerName} (${payload.customerEmail}) — Total: ${formatPrice(payload.total)}</p>${html}`,
      });
    }
  } catch (err) {
    console.error('[email] failed to send order confirmation:', err);
  }
}

export async function sendOrderStatusEmail(
  to: string,
  orderNumber: string,
  status: string,
  customerName: string
) {
  if (!resend) {
    console.log('[email] RESEND_API_KEY not set — skipping status update email');
    return;
  }

  const html = `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;background:#FFF8F0;padding:32px;border-radius:16px;">
    <h1 style="color:#CC3F78;font-size:24px;margin-bottom:4px;">Pink Pistachio</h1>
    <h2 style="color:#3A2E2E;font-size:18px;">Hi ${customerName}, your order status has been updated</h2>
    <p style="color:#5A4A4A;">Order <strong>${orderNumber}</strong> is now: <strong style="color:#CC3F78;">${status}</strong></p>
    <p style="margin-top:24px;color:#A8305F;font-size:14px;">With love,<br/>Pink Pistachio Team</p>
  </div>`;

  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: `Order Update — ${orderNumber} is now ${status} | Pink Pistachio`,
      html,
    });
  } catch (err) {
    console.error('[email] failed to send status email:', err);
  }
}

export async function sendContactReceivedEmail(to: string, name: string) {
  if (!resend) return;
  const html = `
  <div style="font-family:Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;background:#FFF8F0;padding:32px;border-radius:16px;">
    <h1 style="color:#CC3F78;font-size:24px;">Pink Pistachio</h1>
    <p style="color:#3A2E2E;">Hi ${name}, thanks for reaching out — our team will get back to you within 24 hours.</p>
  </div>`;
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject: 'We received your message | Pink Pistachio',
      html,
    });
  } catch (err) {
    console.error('[email] contact email failed:', err);
  }
}