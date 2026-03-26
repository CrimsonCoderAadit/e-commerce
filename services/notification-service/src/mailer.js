const nodemailer = require('nodemailer');

let transporter = null;
let usingEthereal = false;

async function createTransporter() {
  // Use real SMTP if all three env vars are provided
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    usingEthereal = false;
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fall back to auto-generated Ethereal test account
  console.log('No SMTP env vars set — creating Ethereal test account');
  const testAccount = await nodemailer.createTestAccount();
  usingEthereal = true;
  console.log('Ethereal account:', testAccount.user);
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

async function getTransporter() {
  if (!transporter) {
    transporter = await createTransporter();
  }
  return transporter;
}

function buildOrderHtml({ orderId, items, totalAmount, timestamp }) {
  const rows = items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border:1px solid #ddd">${item.productName}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:center">${item.quantity}</td>
          <td style="padding:8px;border:1px solid #ddd;text-align:right">
            ₹${(item.price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </td>
        </tr>`
    )
    .join('');

  const formattedTotal = `₹${Number(totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const formattedDate  = new Date(timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
  <h2 style="color:#2c3e50">Order Confirmed!</h2>
  <p>Thank you for your purchase. Your order has been placed successfully.</p>

  <table style="width:100%;border-collapse:collapse;margin:16px 0">
    <tr style="background:#f4f4f4">
      <th style="padding:8px;border:1px solid #ddd;text-align:left">Item</th>
      <th style="padding:8px;border:1px solid #ddd;text-align:center">Qty</th>
      <th style="padding:8px;border:1px solid #ddd;text-align:right">Amount</th>
    </tr>
    ${rows}
    <tr style="background:#f9f9f9;font-weight:bold">
      <td colspan="2" style="padding:8px;border:1px solid #ddd">Total</td>
      <td style="padding:8px;border:1px solid #ddd;text-align:right">${formattedTotal}</td>
    </tr>
  </table>

  <p style="color:#666;font-size:13px">
    <strong>Order ID:</strong> ${orderId}<br>
    <strong>Placed at:</strong> ${formattedDate}
  </p>
  <p style="color:#999;font-size:12px">This is an automated message — please do not reply.</p>
</body>
</html>`;
}

async function sendOrderEmail(payload) {
  const { orderId } = payload;
  const smtp = await getTransporter();

  const info = await smtp.sendMail({
    from:    `"Ecommerce App" <no-reply@ecommerce.local>`,
    to:      process.env.NOTIFICATION_EMAIL || 'test@example.com',
    subject: `Order Confirmed — #${orderId}`,
    html:    buildOrderHtml(payload),
  });

  if (usingEthereal) {
    console.log('Ethereal preview URL:', nodemailer.getTestMessageUrl(info));
  }

  return info;
}

module.exports = { sendOrderEmail };
