"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { z } from "zod";

const CreateSchema = z.object({
  resourceId: z.string().min(1),
  dateISO: z.string().datetime(),
});

function normalizeDayFromLocal(d: Date) {
  // Take the LOCAL calendar day the user selected…
  // …store it as UTC midnight for stable uniqueness.
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0));
}

export async function createBookingAction(input: { resourceId: string; dateISO: string }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false as const, error: "Not logged in." };

  const parsed = CreateSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: "Invalid input." };

  const date = new Date(parsed.data.dateISO);
  if (Number.isNaN(date.getTime())) return { success: false as const, error: "Invalid date." };

  const day = normalizeDayFromLocal(date);

  try {
    await prisma.booking.create({
      data: {
        userId: session.user.id,
        resourceId: parsed.data.resourceId,
        date: day,
      },
    });
    return { success: true as const };
  } catch (e: any) {
    if (e?.code === "P2002") {
      return { success: false as const, error: "Redan bokad för den lokalen och dagen." };
    }
    return { success: false as const, error: "Serverfel." };
  }
}

export async function cancelBookingAction(bookingId: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { success: false as const, error: "Not logged in." };

  const deleted = await prisma.booking.deleteMany({
    where: { id: bookingId, userId: session.user.id },
  });

  if (deleted.count === 0) return { success: false as const, error: "Hittades inte." };
  return { success: true as const };
}
