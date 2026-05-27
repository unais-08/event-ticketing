import "dotenv/config";
import { hash } from "bcryptjs";
import prisma from "./prisma.js";
import { logger, serializeError } from "./logger.js";

async function main() {
  logger.info("Database seed started.");

  await prisma.ticket.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await hash("Password123!", 10);

  const [admin, attendeeOne, attendeeTwo] = await Promise.all([
    prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password: passwordHash,
        role: "ADMIN",
      },
    }),
    prisma.user.create({
      data: {
        name: "Ava Johnson",
        email: "ava.johnson@example.com",
        password: passwordHash,
      },
    }),
    prisma.user.create({
      data: {
        name: "Noah Smith",
        email: "noah.smith@example.com",
        password: passwordHash,
      },
    }),
  ]);

  const [eventOne, eventTwo] = await Promise.all([
    prisma.event.create({
      data: {
        title: "Summer Music Festival",
        description: "A full-day outdoor concert with local and guest artists.",
        location: "Central Park, New York",
        date: new Date("2026-08-15T18:00:00.000Z"),
        capacity: 500,
      },
    }),
    prisma.event.create({
      data: {
        title: "Tech Expo 2026",
        description: "A showcase of emerging tools, startups, and product demos.",
        location: "Javits Center, New York",
        date: new Date("2026-09-10T09:00:00.000Z"),
        capacity: 300,
      },
    }),
  ]);

  await prisma.ticket.createMany({
    data: [
      {
        userId: admin.id,
        eventId: eventOne.id,
        qrCode: "QR-ADMIN-001",
        checkedIn: true,
      },
      {
        userId: attendeeOne.id,
        eventId: eventOne.id,
        qrCode: "QR-AVA-002",
        checkedIn: false,
      },
      {
        userId: attendeeTwo.id,
        eventId: eventTwo.id,
        qrCode: "QR-NOAH-003",
        checkedIn: false,
      },
    ],
  });

  logger.info("Database seed completed successfully.", {
    users: 3,
    events: 2,
    tickets: 3,
  });
}

main()
  .catch((error) => {
    logger.error("Database seed failed.", { error: serializeError(error) });
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });