import { hash } from "bcryptjs";
import { Role } from "@prisma/client";
import prisma from "../../../config/prisma.js";
import { logger } from "../../../config/logger.js";
import { createAuthSession, type PublicUser } from "../../auth/auth.service.js";
import type { RegisterInput } from "../../auth/auth.validation.js";

const SALT_ROUNDS = 12;

export class AdminUsersError extends Error {
	readonly statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.name = "AdminUsersError";
		this.statusCode = statusCode;
	}
}

export interface RetrieveUsersQuery {
	page: number;
	limit: number;
	role?: Role;
}

export interface AdminUserListItem {
	id: string;
	name: string;
	email: string;
	role: Role;
	createdAt: Date;
	updatedAt: Date;
	ticketCount: number;
	organizedEventCount: number;
}

export interface RetrieveUsersResult {
	users: AdminUserListItem[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

async function createManagedUserAccount(input: RegisterInput, role: Role): Promise<{ user: PublicUser; token: string }> {
	const existingUser = await prisma.user.findUnique({
		where: {
			email: input.email,
		},
	});

	if (existingUser) {
		logger.warn("Managed user creation blocked: email already exists.", {
			email: input.email,
			userId: existingUser.id,
		});
		throw new AdminUsersError("Email is already registered.", 409);
	}

	const passwordHash = await hash(input.password, SALT_ROUNDS);

	const user = await prisma.user.create({
		data: {
			name: input.name,
			email: input.email,
			password: passwordHash,
			role,
		},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			createdAt: true,
		},
	});

	logger.info("Managed user account created.", {
		userId: user.id,
		email: user.email,
		role: user.role,
	});

	return createAuthSession(user);
}

export async function retrieveUsers(query: RetrieveUsersQuery): Promise<RetrieveUsersResult> {
	const where = query.role ? { role: query.role } : {};
	const [total, users] = await Promise.all([
		prisma.user.count({ where }),
		prisma.user.findMany({
			where,
			orderBy: {
				createdAt: "desc",
			},
			skip: (query.page - 1) * query.limit,
			take: query.limit,
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				createdAt: true,
				updatedAt: true,
			},
		}),
	]);

	const usersWithCounts = await Promise.all(
		users.map(async (user) => {
			const [ticketCount, organizedEventCount] = await Promise.all([
				prisma.ticket.count({
					where: {
						userId: user.id,
					},
				}),
				prisma.event.count({
					where: {
						organizerId: user.id,
					},
				}),
			]);

			return {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
				ticketCount,
				organizedEventCount,
			};
		}),
	);

	return {
		users: usersWithCounts,
		meta: {
			page: query.page,
			limit: query.limit,
			total,
			totalPages: Math.max(1, Math.ceil(total / query.limit)),
		},
	};
}

export async function createOrganizerAccount(input: RegisterInput): Promise<{ user: PublicUser; token: string }> {
	return createManagedUserAccount(input, Role.ORGANIZER);
}

export async function deleteOrganizerAccount(userId: string): Promise<DeletedOrganizerSummary> {
	const organizer = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			id: true,
			role: true,
		},
	});

	if (!organizer) {
		throw new AdminUsersError("Organizer was not found.", 404);
	}

	if (organizer.role !== Role.ORGANIZER) {
		throw new AdminUsersError("Only organizer accounts can be deleted through this action.", 400);
	}

	const organizerEvents = await prisma.event.findMany({
		where: {
			organizerId: organizer.id,
		},
		select: {
			id: true,
		},
	});

	const eventIds = organizerEvents.map((event) => event.id);

	const [participantTicketDeleteResult, eventTicketDeleteResult, eventDeleteResult] =
		await prisma.$transaction(async (transaction) => {
			const participantTickets = await transaction.ticket.deleteMany({
				where: {
					userId: organizer.id,
				},
			});

			const eventTickets = await transaction.ticket.deleteMany({
				where: {
					eventId: {
						in: eventIds,
					},
				},
			});

			const deletedEvents = await transaction.event.deleteMany({
				where: {
					organizerId: organizer.id,
				},
			});

			await transaction.user.deleteMany({
				where: {
					id: organizer.id,
					role: Role.ORGANIZER,
				},
			});

			return [participantTickets, eventTickets, deletedEvents] as const;
		});

	logger.info("Organizer account deleted.", {
		userId: organizer.id,
		eventCount: eventDeleteResult.count,
		ticketCount: eventTicketDeleteResult.count,
		participantTicketCount: participantTicketDeleteResult.count,
	});

	return {
		userId: organizer.id,
		eventCount: eventDeleteResult.count,
		ticketCount: eventTicketDeleteResult.count,
		participantTicketCount: participantTicketDeleteResult.count,
	};
}

export async function deleteAttendeeAccount(userId: string): Promise<DeletedAttendeeSummary> {
	const attendee = await prisma.user.findUnique({
		where: {
			id: userId,
		},
		select: {
			id: true,
			role: true,
		},
	});

	if (!attendee) {
		throw new AdminUsersError("Attendee was not found.", 404);
	}

	if (attendee.role !== Role.ATTENDEE) {
		throw new AdminUsersError("Only attendee accounts can be deleted through this action.", 400);
	}

	const ticketDeleteResult = await prisma.$transaction(async (transaction) => {
		const deletedTickets = await transaction.ticket.deleteMany({
			where: {
				userId: attendee.id,
			},
		});

		await transaction.user.deleteMany({
			where: {
				id: attendee.id,
				role: Role.ATTENDEE,
			},
		});

		return deletedTickets;
	});

	logger.info("Attendee account deleted.", {
		userId: attendee.id,
		ticketCount: ticketDeleteResult.count,
	});

	return {
		userId: attendee.id,
		ticketCount: ticketDeleteResult.count,
	};
}

export interface DeletedOrganizerSummary {
	userId: string;
	eventCount: number;
	ticketCount: number;
	participantTicketCount: number;
}

export interface DeletedAttendeeSummary {
	userId: string;
	ticketCount: number;
}