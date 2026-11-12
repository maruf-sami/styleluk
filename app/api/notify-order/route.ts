
import { NextResponse } from "next/server";
import { sendOrderNotification, type OrderEmail } from "../../lib/order-email";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isOrderEmail(value: unknown): value is OrderEmail {
  if (!isRecord(value) || !isRecord(value.customer) || !Array.isArray(value.items)) {
    return false;
  }

  const customer = value.customer;
  return (
    typeof value.orderId === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.productTitle === "string" &&
    typeof value.quantity === "number" &&
    value.items.every(
      (item) => isRecord(item) && typeof item.size === "string" && typeof item.color === "string"
    ) &&
    ["name", "phone", "division", "district", "upazila", "address", "note"].every(
      (key) => typeof customer[key] === "string"
    ) &&
    typeof value.shipping === "string" &&
    typeof value.unitSubtotal === "number" &&
    typeof value.sizeSurcharge === "number" &&
    typeof value.deliveryFee === "number" &&
    typeof value.total === "number" &&
    typeof value.paymentMethod === "string"
  );
}

export async function POST(request: Request) {
  const expectedToken =
    process.env.GOOGLE_SHEETS_WEBHOOK_TOKEN || process.env.SECRET_TOKEN;

  if (
    !expectedToken ||
    request.headers.get("authorization") !== `Bearer ${expectedToken}`
  ) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body: unknown = await request.json();
    if (!isRecord(body) || !isOrderEmail(body.order)) {
      return NextResponse.json(
        { success: false, message: "Invalid order payload" },
        { status: 400 }
      );
    }

    await sendOrderNotification(body.order);

    return NextResponse.json({
      success: true,
      message: "Email notification sent",
    });

  } catch (error) {
    console.error("Email error:", error);

    return NextResponse.json({
      success: false,
      message: "Email notification failed",
    }, { status: 500 });
  }
}
