import nodemailer from "nodemailer";

export type OrderEmail = {
  orderId: string;
  createdAt: string;
  productTitle: string;
  quantity: number;
  items: Array<{ size: string; color: string }>;
  customer: {
    name: string;
    phone: string;
    division: string;
    district: string;
    upazila: string;
    address: string;
    note: string;
  };
  shipping: string;
  unitSubtotal: number;
  sizeSurcharge: number;
  deliveryFee: number;
  total: number;
  paymentMethod: string;
};

export async function sendOrderNotification(order: OrderEmail) {
  const emailUser = process.env.EMAIL_USER;
  const appPassword = process.env.EMAIL_APP_PASSWORD;
  const recipient = process.env.ORDER_NOTIFICATION_EMAIL;

  if (!emailUser || !appPassword || !recipient) {
    throw new Error("Order email environment variables are missing.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: appPassword,
    },
  });

  const itemDetails = order.items
    .map((item, index) => `Piece ${index + 1}: ${item.size}, ${item.color}`)
    .join("\n");

  await transporter.sendMail({
    from: `"STYLE LUK" <${emailUser}>`,
    to: recipient,
    subject: `New STYLE LUK Order - ${order.orderId}`,
    text: [
      "NEW ORDER - STYLE LUK",
      `Order ID: ${order.orderId}`,
      `Created at: ${order.createdAt}`,
      "",
      `Customer: ${order.customer.name}`,
      `Phone: ${order.customer.phone}`,
      `Division: ${order.customer.division}`,
      `District: ${order.customer.district}`,
      `Upazila: ${order.customer.upazila}`,
      `Address: ${order.customer.address}`,
      `Note: ${order.customer.note || "None"}`,
      "",
      `Product: ${order.productTitle}`,
      `Quantity: ${order.quantity}`,
      itemDetails,
      `Shipping: ${order.shipping}`,
      `Product subtotal: ৳${order.unitSubtotal}`,
      `4XL surcharge: ৳${order.sizeSurcharge}`,
      `Delivery fee: ৳${order.deliveryFee}`,
      `Total: ৳${order.total}`,
      `Payment: ${order.paymentMethod}`,
    ].join("\n"),
  });
}
