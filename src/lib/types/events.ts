import { ExplorerPlace } from "./canonical-places";

export type EventCategory =
  | "trips"
  | "music"
  | "festivals"
  | "sports"
  | "awareness"
  | "environment"
  | "culture"
  | "workshops"
  | "business"
  | "photography"
  | "food"
  | "wellness"
  | "auto"
  | "family"
  | "seasonal";

export type EventAccessType =
  | "FREE"
  | "PAID"
  | "REGISTRATION_REQUIRED"
  | "TICKET_REQUIRED"
  | "INVITATION_ONLY"
  | "GROUP_TRIP";

export type EventStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "CHANGES_REQUESTED"
  | "CANCELLED"
  | "COMPLETED";

export interface EventOrganizer {
  id: string;
  name: string;
  slug: string;
  logo: string;
  coverImage?: string;
  description: string;
  verified: boolean;
  website?: string;
  instagram?: string;
  phone?: string;
  email?: string;
  rating?: number;
  totalEventsHosted?: number;
}

export interface GroupTripDetails {
  startingPoint: string;
  destination: string;
  routeSummary: string; // e.g. "Chennai → Kodaikanal → Chennai"
  duration: string; // e.g. "2 Days / 1 Night"
  totalSeats: number;
  joinedCount: number;
  inclusions: string[];
  exclusions: string[];
  accommodation: string;
  transportation: string;
  mealsIncluded: string;
  meetingPoint: string;
  cancellationPolicy: string;
  itinerary: Array<{
    day: number;
    title: string;
    description: string;
    highlights: string[];
  }>;
}

export interface FestivalDetails {
  festivalName: string;
  typicalMonth: string; // e.g. "April - May" (Chithirai)
  typicalSeason: string; // e.g. "Summer / Vaikasi"
  annualRecurring: boolean;
  dateStatus: "EXACT" | "DATE_RANGE" | "APPROXIMATE_MONTH" | "TBA";
  history: string;
  culturalSignificance: string;
  religiousContext: string;
  majorActivities: string[];
  importantDatesDescription?: string;
  processionsAndRituals?: string[];
  bestPlacesToExperience: string[];
  travelTips: string[];
  officialSource?: string;
}

export interface SeasonalCelebrationDetails {
  seasonLabel: string; // e.g. "November – December (Advent & Christmas)"
  regionCovered: string; // e.g. "Nagercoil, Kanyakumari, Marthandam, Colachel"
  festiveStreetsAndChurches: string[];
  localFoodHighlights: string[];
  culturalPrograms: string[];
  travelRecommendations: string[];
}

export interface ExploreTNEvent {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  category: EventCategory;
  categoryLabel: string;
  categoryIcon: string;
  accessType: EventAccessType;
  status: EventStatus;
  
  // Date & Time
  startDate: string; // ISO YYYY-MM-DD or readable
  endDate?: string;
  timeText: string; // e.g. "6:00 PM onwards" or "06:00 AM Departure"
  isAllDay?: boolean;
  dateTbd?: boolean;

  // Location & Geospatial
  locationName: string; // Venue or town
  district: string; // e.g. "Madurai", "Dindigul", "Chennai"
  districtSlug?: string;
  destinationPlaceSlug?: string; // connects to ExploreTN destination
  latitude: number;
  longitude: number;
  address: string;

  // Pricing & Seats
  isFree: boolean;
  priceDisplay: string; // "Free Entry", "From ₹499", "₹3,499/person"
  priceNumber?: number;
  currency?: string;
  totalCapacity?: number;
  availableSeats?: number;
  attendeesCount?: number;

  // Visuals
  coverImage: string;
  galleryImages?: string[];

  // Organizer
  organizer: EventOrganizer;
  isExploreTnVerified: boolean;

  // Custom Specific Data
  groupTrip?: GroupTripDetails;
  festival?: FestivalDetails;
  seasonal?: SeasonalCelebrationDetails;

  // Tags & Metadata
  tags: string[];
  featured?: boolean;
}

export interface FestivalCalendarMonth {
  monthIndex: number; // 1-12
  monthName: string;
  tamilMonth: string;
  seasonName: string;
  description: string;
  featuredFestivals: string[]; // event IDs or titles
}
