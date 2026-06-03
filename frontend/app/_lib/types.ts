export type Role = "ATTENDEE" | "ORGANIZER" | "CHECKER" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  tokenType: "Bearer";
  expiresIn: string;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PublicEventListItem {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  capacity: number;
  ticketCount: number;
  organizerId: string;
  createdAt: string;
  updatedAt?: string | null;
}

export interface PublicEventListResponse {
  events: PublicEventListItem[];
  meta: PaginationMeta;
}

export interface OrganizerSummary {
  id: string;
  name: string;
  email: string;
}

export interface PublicEventDetails {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  capacity: number;
  ticketCount: number;
  organizer: OrganizerSummary;
  createdAt: string;
  updatedAt?: string | null;
}

export interface TicketListItem {
  id: string;
  qrCode: string;
  checkedIn: boolean;
  eventId: string;
  eventTitle: string;
  createdAt: string;
}

export interface TicketListResponse {
  tickets: TicketListItem[];
  meta: PaginationMeta;
}

export interface TicketPurchaseResponse {
  id: string;
  userId: string;
  eventId: string;
  qrCode: string;
  checkedIn: boolean;
  createdAt: string;
}
