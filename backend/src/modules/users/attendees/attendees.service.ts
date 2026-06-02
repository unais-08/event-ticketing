import prisma from "../../../config/prisma.js";
import { logger } from "../../../config/logger.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Attendee-facing business logic.
 * Responsibilities:
 * - Public event listing and details
 * - Ticket purchase (respecting event capacity and duplicate purchase)
 * - Attendee ticket listing, details and cancellation
 */

export async function listPublicEvents(page = 1, limit = 20) {
  const where = {};

  const [total, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: { date: "asc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        date: true,
        capacity: true,
        organizerId: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const items = await Promise.all(
    events.map(async (e) => {
      const ticketCount = await prisma.ticket.count({ where: { eventId: e.id } });

      return {
        id: e.id,
        title: e.title,
        description: e.description,
        location: e.location,
        date: e.date,
        capacity: e.capacity,
        ticketCount,
        organizerId: e.organizerId,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      };
    }),
  );

  return {
    events: items,
    meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
}

export async function getPublicEventDetails(eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId }, include: { organizer: { select: { id: true, name: true, email: true } } } });

  if (!event) {
    throw new Error("Event not found");
  }

  const ticketCount = await prisma.ticket.count({ where: { eventId: event.id } });

  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    date: event.date,
    capacity: event.capacity,
    ticketCount,
    organizer: event.organizer,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  };
}

export async function purchaseTicket(userId: string, eventId: string) {
  // Ensure event exists and capacity is available; prevent duplicate purchases
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true, capacity: true } });

  if (!event) {
    throw new Error("Event not found");
  }

  // Prevent duplicate ticket for same user + event
  const existing = await prisma.ticket.findUnique({ where: { userId_eventId: { userId, eventId } } as any });
  if (existing) {
    throw new Error("User already has a ticket for this event");
  }

  const ticketCount = await prisma.ticket.count({ where: { eventId } });

  if (ticketCount >= event.capacity) {
    throw new Error("Event is sold out");
  }

  const qrCode = uuidv4();

  const ticket = await prisma.ticket.create({
    data: {
      userId,
      eventId,
      qrCode,
    },
  });

  logger.info("Ticket purchased.", { userId, eventId, ticketId: ticket.id });

  return ticket;
}

export async function listTicketsForUser(userId: string, page = 1, limit = 50) {
  const where = { userId };

  const [total, tickets] = await Promise.all([
    prisma.ticket.count({ where }),
    prisma.ticket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { event: true },
    }),
  ]);

  const items = tickets.map((t) => ({
    id: t.id,
    qrCode: t.qrCode,
    checkedIn: t.checkedIn,
    eventId: t.eventId,
    eventTitle: t.event.title,
    createdAt: t.createdAt,
  }));

  return { tickets: items, meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } };
}

export async function getTicketDetails(userId: string, ticketId: string) {
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId }, include: { event: true, user: { select: { id: true, name: true, email: true } } } });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  if (ticket.userId !== userId) {
    throw new Error("Not authorized to access this ticket");
  }

  return ticket;
}

export async function cancelTicket(userId: string, ticketId: string) {
  // Ensure the ticket belongs to the user and delete it
  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId }, select: { id: true, userId: true } });

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  if (ticket.userId !== userId) {
    throw new Error("Not authorized to cancel this ticket");
  }

  await prisma.ticket.delete({ where: { id: ticketId } });

  logger.info("Ticket cancelled.", { userId, ticketId });

  return { ticketId };
}
