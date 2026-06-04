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

export interface OrganizerEventListItem {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  capacity: number;
  ticketCount: number;
  createdAt: string;
  updatedAt?: string | null;
}

export interface OrganizerEventDetails extends OrganizerEventListItem {}

export interface OrganizerEventFormInput {
  title: string;
  description: string;
  location: string;
  date: string;
  capacity: number;
}

export interface OrganizerTicketItem {
  id: string;
  qrCode: string;
  checkedIn: boolean;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
}

export interface CheckinResult {
  alreadyCheckedIn: boolean;
  ticketId: string;
  ticket?: {
    id: string;
    checkedIn: boolean;
  };
}

export interface AdminUserListItem {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
  ticketCount: number;
  organizedEventCount: number;
}

export interface AdminUserListResponse {
  users: AdminUserListItem[];
  meta: PaginationMeta;
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
