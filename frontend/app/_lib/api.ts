import { apiClient } from "./api-client";
import type {
  ApiResponse,
  AdminUserListResponse,
  CheckinResult,
  AuthSession,
  OrganizerEventDetails,
  OrganizerEventFormInput,
  OrganizerEventListItem,
  OrganizerTicketItem,
  PublicEventDetails,
  PublicEventListResponse,
  TicketListResponse,
  TicketPurchaseResponse,
  User,
} from "./types";

export async function getPublicEvents(params?: { page?: number; limit?: number }) {
  const response = await apiClient.get<ApiResponse<PublicEventListResponse>>("/attendees/events", { params });
  return response.data;
}

export async function getPublicEventDetails(eventId: string) {
  const response = await apiClient.get<ApiResponse<PublicEventDetails>>(`/attendees/events/${eventId}`);
  return response.data;
}

export async function registerUser(payload: { name: string; email: string; password: string }) {
  const response = await apiClient.post<ApiResponse<AuthSession>>("/auth/register", payload);
  return response.data;
}

export async function loginUser(payload: { email: string; password: string }) {
  const response = await apiClient.post<ApiResponse<AuthSession>>("/auth/login", payload);
  return response.data;
}

export async function getMe() {
  const response = await apiClient.get<ApiResponse<{ user: User }>>("/auth/me");
  return response.data;
}

export async function purchaseTicket(eventId: string) {
  const response = await apiClient.post<ApiResponse<TicketPurchaseResponse>>("/attendees/tickets", {
    eventId,
  });
  return response.data;
}

export async function getMyTickets(params?: { page?: number; limit?: number }) {
  const response = await apiClient.get<ApiResponse<TicketListResponse>>("/attendees/tickets", { params });
  return response.data;
}

export async function getTicketQr(ticketId: string) {
  const response = await apiClient.get<ApiResponse<{ token: string; dataUrl: string }>>(`/attendees/tickets/${ticketId}/qr`);
  return response.data;
}

// Organizer APIs
export async function getOrganizerEvents(params?: { page?: number; limit?: number }) {
  const response = await apiClient.get<
    ApiResponse<{ events: OrganizerEventListItem[]; meta: { page: number; limit: number; total: number; totalPages: number } }>
  >(`/organizers/events`, { params });
  return response.data;
}

export async function getOrganizerEvent(eventId: string) {
  const response = await apiClient.get<ApiResponse<OrganizerEventDetails>>(`/organizers/events/${eventId}`);
  return response.data;
}

export async function getOrganizerEventTickets(eventId: string) {
  const response = await apiClient.get<ApiResponse<OrganizerTicketItem[]>>(`/organizers/events/${eventId}/tickets`);
  return response.data;
}

export async function checkinByToken(token: string) {
  const response = await apiClient.post<ApiResponse<CheckinResult>>(`/checkin/${encodeURIComponent(token)}`);
  return response.data;
}

export async function createOrganizerEvent(payload: OrganizerEventFormInput) {
  const response = await apiClient.post<ApiResponse<OrganizerEventDetails>>(`/organizers/events`, payload);
  return response.data;
}

export async function updateOrganizerEvent(eventId: string, payload: Partial<OrganizerEventFormInput>) {
  const response = await apiClient.put<ApiResponse<OrganizerEventDetails>>(`/organizers/events/${eventId}`, payload);
  return response.data;
}

export async function deleteOrganizerEvent(eventId: string) {
  const response = await apiClient.delete<ApiResponse<{ eventId: string }>>(`/organizers/events/${eventId}`);
  return response.data;
}

// Admin APIs
export async function getAdminUsers(params?: { page?: number; limit?: number; role?: string }) {
  const response = await apiClient.get<ApiResponse<AdminUserListResponse>>(`/admin/users`, { params });
  return response.data;
}

export async function createCheckerAccount(payload: { name: string; email: string; password: string }) {
  const response = await apiClient.post<ApiResponse<AuthSession>>(`/admin/users/checkers`, payload);
  return response.data;
}

export async function deleteCheckerAccount(userId: string) {
  const response = await apiClient.delete<ApiResponse<{ userId: string; ticketCount: number }>>(`/admin/users/checkers/${userId}`);
  return response.data;
}
