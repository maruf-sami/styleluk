
import { sendOrderNotification } from "../../lib/order-email";

type ItemSelection = {
  size: string;
  color: string;
};

type CheckoutRequest = {
  name: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  address: string;
  note?: string;
  productId: string;
  quantity: number;
  items: ItemSelection[];
  shipping: "inside" | "outside";
};

const offers = {
  single: {
    title: "প্রিমিয়াম কার্গো প্যান্ট",
    price: 880,
    pieces: 1,
  },
  two: {
    title: "২ পিসের প্রিমিয়াম কার্গো প্যান্ট",
    price: 1380,
    pieces: 2,
  },
  three: {
    title: "প্রিমিয়াম কার্গো প্যান্ট কম্বো - (৩-প্যাক)",
    price: 1880,
    pieces: 3,
  },
} as const;

const sizes = new Set(["L", "XL", "XXL", "XXXL", "4XL"]);
const colors = new Set(["Black", "Olive", "Beige", "Navy"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { success: false, message: "অর্ডারের তথ্য সঠিক নয়।" },
      { status: 400 }
    );
  }

  if (!isRecord(body)) {
    return Response.json(
      { success: false, message: "অর্ডারের তথ্য সঠিক নয়।" },
      { status: 400 }
    );
  }

  const input = body as unknown as CheckoutRequest;

  const offer = offers[input.productId as keyof typeof offers];

  const phone =
    typeof input.phone === "string"
      ? input.phone.replace(/[\s-]/g, "")
      : "";

  // Bangladesh phone number validation
  const phonePattern = /^(?:\+?88)?01[3-9]\d{8}$/;
  const quantityIsValid =
    Number.isInteger(input.quantity) &&
    input.quantity >= 1 &&
    input.quantity <= 10;

  if (
    !offer ||
    !quantityIsValid ||
    !isNonEmptyString(input.name) ||
    !phonePattern.test(phone) ||
    !isNonEmptyString(input.division) ||
    !isNonEmptyString(input.district) ||
    !isNonEmptyString(input.upazila) ||
    !isNonEmptyString(input.address) ||
    !["inside", "outside"].includes(input.shipping) ||
    !Array.isArray(input.items) ||
    input.items.length !== offer.pieces * input.quantity ||
    input.items.some(
      (item) =>
        !item ||
        !sizes.has(item.size) ||
        !colors.has(item.color)
    )
  ) {
    return Response.json(
      { success: false, message: "অর্ডারের তথ্য যাচাই করুন।" },
      { status: 400 }
    );
  }

  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

  const token =
    process.env.GOOGLE_SHEETS_WEBHOOK_TOKEN || process.env.SECRET_TOKEN;

  if (!scriptUrl || !token) {
    console.error("Google Sheets environment variables are missing.");

    return Response.json(
      {
        success: false,
        message: "অর্ডার সেবা বর্তমানে প্রস্তুত নয়।",
      },
      { status: 503 }
    );
  }

  const sizeSurcharge = input.items.some(
    (item) => item.size === "4XL"
  )
    ? 100
    : 0;

  const unitSubtotal = offer.price * input.quantity;

  const deliveryFee =
    input.shipping === "inside" ? 70 : 120;

  const order = {
    orderId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),

    productId: input.productId,
    productTitle: offer.title,
    quantity: input.quantity,

    items: input.items,

    customer: {
      name: input.name.trim(),
      phone,
      division: input.division,
      district: input.district,
      upazila: input.upazila,
      address: input.address.trim(),
      note:
        typeof input.note === "string"
          ? input.note.trim()
          : "",
    },

    shipping:
      input.shipping === "inside"
        ? "ঢাকার ভিতরে"
        : "ঢাকার বাইরে",

    unitSubtotal,
    sizeSurcharge,
    deliveryFee,

    total: unitSubtotal + sizeSurcharge + deliveryFee,

    paymentMethod: "Cash on Delivery",
  };

  try {
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        token,
        order,
      }),
      redirect: "follow",
      cache: "no-store",
    });

    // Read response only once
    const responseText = await response.text();

    let result: unknown;

    try {
      result = JSON.parse(responseText);
    } catch {
      result = null;
    }

    if (
      !response.ok ||
      !isRecord(result) ||
      result.ok !== true
    ) {
      console.error(
        "Google Sheets rejected order:",
        result
      );

      return Response.json(
        {
          success: false,
          message: "অর্ডার জমা হয়নি। আবার চেষ্টা করুন।",
        },
        { status: 502 }
      );
    }

    try {
      await sendOrderNotification(order);
    } catch (error) {
      console.error("Order was saved, but email notification failed:", error);
    }

    return Response.json({
      success: true,
      message: "অর্ডার সফলভাবে জমা হয়েছে।",
      orderId: order.orderId,
    });

  } catch (error) {
    console.error("Order submission error:", error);

    return Response.json(
      {
        success: false,
        message: "অর্ডার জমা হয়নি। আবার চেষ্টা করুন।",
      },
      { status: 502 }
    );
  }
}
