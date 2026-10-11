import { z } from "zod";

const text = (max) => z.string().trim().max(max);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Public form: POST /api/contact
export const contactSchema = z.object({
  name: text(120).min(1, "Name is required."),
  email: text(254).regex(EMAIL_RE, "A valid email address is required."),
  subject: text(200).optional().transform((s) => s || undefined), // empty -> model default
  message: text(5000).min(1, "Message is required."),
});

// Admin inbox: GET /api/contact?filter=unread&q=term&page=2&limit=20
export const messageQuerySchema = z.object({
  filter: z.enum(["all", "unread", "read"]).default("all"),
  q: z.string().trim().max(100).default(""),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

// Admin: PATCH /api/contact/:id
export const readFlagSchema = z.object({ read: z.boolean() });