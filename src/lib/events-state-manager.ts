import { ExploreTNEvent } from "./types/events";

export interface EventBooking {
  id: string;
  eventId: string;
  eventTitle: string;
  eventSlug: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  bookingType: "TRIP_SEAT" | "TICKET" | "REGISTRATION";
  numberOfSeats: number;
  totalAmount: number;
  bookedAt: string;
  status: "CONFIRMED" | "CANCELLED" | "PENDING";
  emergencyContact?: string;
  notes?: string;
}

export interface SuggestedFestivalSubmission {
  id: string;
  festivalName: string;
  district: string;
  location: string;
  typicalMonth: string;
  description: string;
  culturalSignificance?: string;
  photoUrl?: string;
  officialSource?: string;
  submitterName: string;
  submitterEmail: string;
  submittedAt: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
}

export function getSavedEventIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("etn_saved_events");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveEventToUser(eventId: string) {
  if (typeof window === "undefined") return;
  const current = getSavedEventIds();
  if (current.includes(eventId)) return;
  const updated = [eventId, ...current];
  localStorage.setItem("etn_saved_events", JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("etn_saved_events_updated", { detail: updated }));
}

export function removeSavedEvent(eventId: string) {
  if (typeof window === "undefined") return;
  const current = getSavedEventIds();
  const updated = current.filter((id) => id !== eventId);
  localStorage.setItem("etn_saved_events", JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("etn_saved_events_updated", { detail: updated }));
}

export function getUserBookings(): EventBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("etn_user_event_bookings");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveUserBooking(booking: EventBooking) {
  if (typeof window === "undefined") return;
  const current = getUserBookings();
  const updated = [booking, ...current];
  localStorage.setItem("etn_user_event_bookings", JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("etn_event_bookings_updated", { detail: updated }));
}

export function getCommunityFestivalSuggestions(): SuggestedFestivalSubmission[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("etn_festival_suggestions");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveFestivalSuggestion(submission: SuggestedFestivalSubmission) {
  if (typeof window === "undefined") return;
  const current = getCommunityFestivalSuggestions();
  const updated = [submission, ...current];
  localStorage.setItem("etn_festival_suggestions", JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent("etn_festival_suggestions_updated", { detail: updated }));
}
