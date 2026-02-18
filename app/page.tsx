import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, RedirectType } from "next/navigation";
import prisma from "@/lib/prisma";
import BookingClient from "@/components/booking-client";

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login", RedirectType.push);

  const resources = await prisma.resource.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const myBookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    select: { id: true, date: true, resource: { select: { name: true } } },
    take: 50,
  });

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 p-6">
      <h1 className="text-3xl font-bold">Boka lokal</h1>

      <BookingClient
        resources={resources}
        myBookings={myBookings.map((b) => ({
          id: b.id,
          date: b.date.toISOString(),
          resourceName: b.resource.name,
        }))}
      />
    </main>
  );
}
