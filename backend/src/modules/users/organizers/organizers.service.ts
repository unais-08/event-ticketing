import { Role } from "@prisma/client";
import prisma from "../../../config/prisma.js";
import { logger } from "../../../config/logger.js";

/**
 * Services used by organizer-facing endpoints.
 * Responsibilities:
 * - Allow an organizer to CRUD their events
 * - Provide event and ticket listings scoped to the requesting organizer
 * - Safely remove event resources (tickets) when an event is deleted
 */

export interface EventListItem {
  id: string;
  title: string;
  description: string;
  location: string;
  date: Date;
  capacity: number;
  ticketCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventDetails extends EventListItem {}

export interface TicketListItem {
  id: string;
  qrCode: string;
  checkedIn: boolean;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: Date;
}

export async function listEventsForOrganizer(organizerId: string, page = 1, limit = 20) {
  const where = { organizerId };

  const [total, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        date: true,
        capacity: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  const eventsWithCounts = await Promise.all(
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
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
      } as EventListItem;
    }),
  );

  return {
    events: eventsWithCounts,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  };
}

export async function createEvent(organizerId: string, data: {
  title: string;
  description: string;
  location: string;
  date: string | Date;
  capacity: number;
}) {
  // ensure organizer exists and role is ORGANIZER
  const organizer = await prisma.user.findUnique({ where: { id: organizerId }, select: { id: true, role: true } });

  if (!organizer) {
    throw new Error("Organizer not found");
  }

  if (organizer.role !== Role.ORGANIZER) {
    throw new Error("Only organizer accounts can create events");
  }

  const event = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description,
      location: data.location,
      date: new Date(data.date),
      capacity: data.capacity,
      organizerId,
    },
  });

  logger.info("Event created by organizer.", { organizerId, eventId: event.id });

  return event;
}

export async function getEventDetails(organizerId: string, eventId: string, requesterIsAdmin = false) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });

  if (!event) {
    throw new Error("Event not found");
  }

  if (!requesterIsAdmin && event.organizerId !== organizerId) {
    throw new Error("Not authorized to access this event");
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
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  } as EventDetails;
}

export type UpdateEventPayload = {
  title?: string | undefined;
  description?: string | undefined;
  location?: string | undefined;
  date?: string | Date | undefined;
  capacity?: number | undefined;
};

export async function updateEvent(organizerId: string, eventId: string, data: UpdateEventPayload, requesterIsAdmin = false) {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true, organizerId: true } });

  if (!event) {
    throw new Error("Event not found");
  }

  if (!requesterIsAdmin && event.organizerId !== organizerId) {
    throw new Error("Not authorized to update this event");
  }

  const updateData: any = {};

  if (data.title !== undefined) updateData.title = data.title;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.capacity !== undefined) updateData.capacity = data.capacity;
  if (data.date !== undefined) updateData.date = new Date(data.date as string | Date);

  const updated = await prisma.event.update({ where: { id: eventId }, data: updateData });

  logger.info("Event updated by organizer.", { organizerId, eventId });

  return updated;
}

export async function deleteEvent(organizerId: string, eventId: string, requesterIsAdmin = false) {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true, organizerId: true } });

  if (!event) {
    throw new Error("Event not found");
  }

  if (!requesterIsAdmin && event.organizerId !== organizerId) {
    throw new Error("Not authorized to delete this event");
  }

  const [deletedTickets, deletedEvent] = await prisma.$transaction(async (tx) => {
    const t = await tx.ticket.deleteMany({ where: { eventId: event.id } });
    const e = await tx.event.delete({ where: { id: event.id } });
    return [t, e] as const;
  });

  logger.info("Event deleted by organizer.", { organizerId, eventId, ticketCount: (deletedTickets as any).count ?? 0 });

  return { eventId: event.id };
}

export async function listTicketsForEvent(organizerId: string, eventId: string, requesterIsAdmin = false) {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true, organizerId: true } });

  if (!event) {
    throw new Error("Event not found");
  }

  if (!requesterIsAdmin && event.organizerId !== organizerId) {
    throw new Error("Not authorized to access tickets for this event");
  }

  const tickets = await prisma.ticket.findMany({
    where: { eventId: event.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      qrCode: true,
      checkedIn: true,
      userId: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return tickets.map((t) => ({
    id: t.id,
    qrCode: t.qrCode,
    checkedIn: t.checkedIn,
    userId: t.userId,
    userName: t.user.name,
    userEmail: t.user.email,
    createdAt: t.createdAt,
  })) as TicketListItem[];
}
