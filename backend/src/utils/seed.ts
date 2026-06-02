import "dotenv/config";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { Role } from "@prisma/client";
import prisma from "../config/prisma.js";
import { logger, serializeError } from "../config/logger.js";

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFrom<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error("randomFrom requires a non-empty array");
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function makeEmail(name: string, domain = "example.com") {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".")}@${domain}`;
}

const FIRST_NAMES = ["Ava", "Noah", "Liam", "Olivia", "Emma", "Mason", "Lucas", "Mia", "Amelia", "Ethan", "Harper", "Evelyn", "Logan", "Sophia", "Isabella"];
const LAST_NAMES = ["Johnson", "Smith", "Brown", "Davis", "Wilson", "Anderson", "Taylor", "Thomas", "Moore", "Martin"];

async function createUser(name: string, email: string, password: string, role: Role) {
  const passwordHash = await hash(password, 10);

  return prisma.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role,
    },
  });
}

async function main() {
  logger.info("Database seed started (comprehensive).");

  // Clean slate
  await prisma.ticket.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  const password = "Password123!";

  // Admin
  const admin = await createUser("Admin User", "admin@example.com", password, Role.ADMIN);

  // Organizers
  const organizers: any[] = [];
  for (let i = 1; i <= 3; i++) {
    const name = `Organizer ${i}`;
    const email = `organizer${i}@example.com`;
    organizers.push(await createUser(name, email, password, Role.ORGANIZER));
  }

  // Checkers
  const checkers: any[] = [];
  for (let i = 1; i <= 5; i++) {
    const name = `Checker ${i}`;
    const email = `checker${i}@example.com`;
    checkers.push(await createUser(name, email, password, Role.CHECKER));
  }

  // Attendees
  const attendees: any[] = [];
  const attendeeCount = 60;
  for (let i = 1; i <= attendeeCount; i++) {
    const first = randomFrom(FIRST_NAMES);
    const last = randomFrom(LAST_NAMES);
    const name = `${first} ${last}`;
    const email = makeEmail(`${first}.${last}${i}`, "example.com");
    attendees.push(await createUser(name, email, password, Role.ATTENDEE));
  }

  // Events - each organizer hosts several events
  const events: any[] = [];
  for (const org of organizers) {
    const eventCount = randomInt(3, 6);
    for (let i = 0; i < eventCount; i++) {
      const title = `${randomFrom(["Music Fest", "Tech Expo", "Community Meetup", "Charity Gala", "Food Carnival"]) } — ${org.name} #${i + 1}`;
      const description = `An event presented by ${org.name}. Enjoy great programming and networking.`;
      const location = randomFrom(["Central Park", "Javits Center", "Town Hall", "Convention Center", "Riverside Stage"]);
      const date = new Date(Date.now() + randomInt(7, 120) * 24 * 60 * 60 * 1000); // 1-120 days from now
      const capacity = randomInt(50, 500);

      const ev = await prisma.event.create({
        data: {
          title,
          description,
          location,
          date,
          capacity,
          organizerId: org.id,
        },
      });

      events.push(ev);
    }
  }

  // Tickets - attendees buy 0..4 tickets for random events
  const createdTickets: any[] = [];
  const allEventIds = events.map((e) => e.id);

  for (const attendee of attendees) {
    const ticketsToBuy = randomInt(0, 4);
    const chosen = new Set<string>();

    for (let t = 0; t < ticketsToBuy; t++) {
      const eventId = randomFrom(allEventIds);
      if (chosen.has(eventId)) continue; // one ticket per event per user
      chosen.add(eventId);

      const ticket = await prisma.ticket.create({
        data: {
          userId: attendee.id,
          eventId,
          qrCode: uuidv4(),
          checkedIn: false,
        },
      });

      createdTickets.push(ticket);
    }
  }

  logger.info("Database seed completed successfully.", {
    users: 1 + organizers.length + checkers.length + attendees.length,
    events: events.length,
    tickets: createdTickets.length,
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
