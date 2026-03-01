// ... existing imports
import nodemailer from 'nodemailer';

const email = process.env.GOOGLE_EMAIL ?? 'adepojuololade2020@gmail.com';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD, 
    },
});

export const sendOrderNotification = async (to: string, orderDetails: any) => {
    try {
        console.log('Sending order notification email to:', to);
        const isUnconfirmed = orderDetails.status === 'unconfirmed';
        const subject = isUnconfirmed ? 'Action Required: Confirm Bank Transfer' : 'New Order Notification';
        
        const mailOptions = {
            from: email,
            to,
            subject,
            html: `
        <h1>${subject}</h1>
        <p>${isUnconfirmed ? 'A user has submitted a bank transfer for confirmation.' : 'A new order has been placed.'}</p>
        <p><strong>Transaction Reference:</strong> ${orderDetails.tx_ref}</p>
        <p><strong>Amount:</strong> ₦${orderDetails.amount.toLocaleString()}</p>
        <p><strong>Payment Method:</strong> ${orderDetails.method || 'Card'}</p>
        ${orderDetails.payeeName ? `<p><strong>Payee Name:</strong> ${orderDetails.payeeName}</p>` : ''}
        ${orderDetails.receiptUrl ? `<p><strong>Receipt:</strong> <a href="${orderDetails.receiptUrl}">Click here to view</a></p>` : ''}
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order notification email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending order notification email:', error);
        return null;
    }
};

export const sendVerificationEmail = async (to: string, code: string, name: string) => {
    try {
        console.log('Sending verification email to:', to);
        const mailOptions = {
            from: email,
            to,
            subject: "Verify Your Email - Lois Food and Spices",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #22c55e;">Verify Your Email</h2>
          <p>Hi ${name || "there"},</p>
          <p>You requested to set a password for your Lois Food and Spices account.</p>
          <p>Your verification code is:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #22c55e; font-size: 32px; letter-spacing: 8px; margin: 0;">${code}</h1>
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px;">© 2026 Lois Food and Spices. All rights reserved.</p>
        </div>
      `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Verification email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }
};

export const sendPaymentConfirmationEmail = async (to: string, data: {
    customerName: string;
    contact: string;
    address: string;
    products: any[];
    total: number;
    deliveryFee: number;
    orderId: string;
}) => {
    try {
        console.log('Sending payment confirmation email to:', to);
        const productRows = data.products.map((p: any) => `
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.product.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.quantity}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">₦${p.product.price.toLocaleString()}</td>
            </tr>
        `).join('');

        const mailOptions = {
            from: email,
            to,
            subject: `Order Confirmation - #${data.orderId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #22c55e;">Order Confirmed!</h2>
                    <p>Hi ${data.customerName},</p>
                    <p>Your payment has been confirmed and your order is being processed.</p>
                    
                    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Order Details</h3>
                        <p><strong>Order ID:</strong> ${data.orderId}</p>
                        <p><strong>Delivery Address:</strong> ${data.address}</p>
                        <p><strong>Contact:</strong> ${data.contact}</p>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <thead>
                            <tr style="text-align: left; background: #f3f4f6;">
                                <th style="padding: 8px;">Product</th>
                                <th style="padding: 8px;">Qty</th>
                                <th style="padding: 8px;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productRows}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">Delivery Fee:</td>
                                <td style="padding: 8px;">₦${data.deliveryFee.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td colspan="2" style="padding: 8px; text-align: right; font-weight: bold;">Total:</td>
                                <td style="padding: 8px; font-weight: bold; color: #22c55e;">₦${data.total.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <p>Thank you for shopping with Lois Food and Spices!</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Payment confirmation email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending payment confirmation email:', error);
        return null;
    }
};

