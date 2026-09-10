import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const plans = new Set(["basic", "premium", "custom"]);
const methods = new Set(["monnify", "manual_transfer"]);

export async function POST(request: NextRequest) {
  const session = await auth();
  const userId = String((session?.user as any)?.id || "");
  if (!userId) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const body = await request.json();
  const businessId = String(body.businessId || "");
  const plan = String(body.plan || "");
  const method = String(body.method || "");
  const amount = Number(body.amount || 0);
  const reference = String(body.reference || "").trim();
  const durationCount = Math.max(1, Number(body.durationCount || 1));
  const durationUnit = body.durationUnit === "year" ? "year" : "month";

  if (!businessId || !plans.has(plan) || !methods.has(method) || !reference) {
    return NextResponse.json({ error: "Invalid plan payment details" }, { status: 400 });
  }

  const business = await prisma.business.findUnique({ where: { id: businessId }, select: { id: true, ownerId: true } });
  if (!business || String(business.ownerId) !== userId) {
    return NextResponse.json({ error: "Store access denied" }, { status: 403 });
  }

  const months = durationUnit === "year" ? durationCount * 12 : durationCount;
  const expiresAt = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000);
  const status = method === "monnify" ? "active" : "manual_pending";

  const payment = await prisma.payment.upsert({
    where: { tx_ref: reference },
    create: {
      tx_ref: reference,
      method,
      status,
      amount: Number.isFinite(amount) ? amount : 0,
      planId: plan,
      durationCount,
      durationUnit,
      businessId,
    },
    update: {
      method,
      status,
      amount: Number.isFinite(amount) ? amount : 0,
      planId: plan,
      durationCount,
      durationUnit,
      businessId,
    },
  });

  const updated = await prisma.business.update({
    where: { id: businessId },
    data: {
      plan,
      planStatus: status,
      planExpiresAt: expiresAt,
      planPaymentRef: payment.tx_ref,
      planPaymentMethod: method,
      planAmount: Number.isFinite(amount) ? amount : 0,
    },
  });

  return NextResponse.json({ id: updated.id, plan, planStatus: status, planExpiresAt: expiresAt });
}
