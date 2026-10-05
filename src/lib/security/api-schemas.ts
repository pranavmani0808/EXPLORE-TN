import { z } from "zod";

export const CreatePlaceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  canonical_name: z.string().max(120).optional(),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and dashes")
    .optional(),
  district: z.string().min(2).max(50),
  state: z.string().default("Tamil Nadu"),
  category: z.string().min(2).max(50),
  primary_category: z.string().max(50).optional(),
  latitude: z.coerce.number().min(8.0).max(14.0, "Latitude must be within Tamil Nadu boundaries"),
  longitude: z.coerce.number().min(76.0).max(81.0, "Longitude must be within Tamil Nadu boundaries"),
  tagline: z.string().max(200).optional(),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000),
  image_url: z.string().url("Valid image URL required").optional(),
  rating: z.coerce.number().min(1).max(5).default(4.8),
  review_count: z.coerce.number().min(0).default(1),
  tags: z.array(z.string().max(30)).max(20).optional(),
});

export const UserSyncPayloadSchema = z.object({
  user: z.object({
    id: z.string().min(1, "User ID is required"),
    email: z.string().email("Invalid email format"),
    name: z.string().min(1).max(100).optional(),
    avatar: z.string().url().or(z.literal("")).optional(),
    city: z.string().max(100).optional(),
    location: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
    phone: z.string().max(20).optional(),
    vehicleType: z.string().max(50).optional(),
    vehicle: z.string().max(50).optional(),
    interests: z.array(z.string().max(50)).max(20).optional(),
    targetDistricts: z.array(z.string().max(50)).max(38).optional(),
    budgetTier: z.string().max(50).optional(),
    profileComplete: z.boolean().optional(),
  }),
  isSignUp: z.boolean().optional(),
});

export const PlannerChatPayloadSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(1000, "Message too long").optional(),
  user_message: z.string().max(1000).optional(),
  conversationId: z.string().max(100).optional(),
  session_id: z.string().max(100).optional(),
  origin: z.string().max(100).optional(),
});
