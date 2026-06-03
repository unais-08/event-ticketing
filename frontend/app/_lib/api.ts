import { apiClient } from "./api-client";
import type {
  ApiResponse,
  AuthSession,
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
  const response = await apiClient.get<ApiResponse<{ events: any[]; meta: any }>>(`/organizers/events`, { params });
  return response.data;
}

export async function getOrganizerEvent(eventId: string) {
  const response = await apiClient.get<ApiResponse<any>>(`/organizers/events/${eventId}`);
  return response.data;
}

export async function getOrganizerEventTickets(eventId: string) {
  const response = await apiClient.get<ApiResponse<any[]>>(`/organizers/events/${eventId}/tickets`);
  return response.data;
}

export async function checkinByToken(token: string) {
  const response = await apiClient.post<ApiResponse<any>>(`/checkin/${token}`);
  return response.data;
}

export async function createOrganizerEvent(payload: { title: string; description: string; location: string; date: string | Date; capacity: number }) {
  const response = await apiClient.post<ApiResponse<any>>(`/organizers/events`, payload);
  return response.data;
}
