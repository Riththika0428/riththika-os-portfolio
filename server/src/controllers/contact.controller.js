import { ContactMessage } from "../models/ContactMessage.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { messageQuerySchema } from "../validators/contact.validator.js";
import { notifyNewMessage } from "../utils/mailer.js";

const OBJECT_ID = /^[a-f\d]{24}$/i;
const assertValidId = (id) => {
  if (!OBJECT_ID.test(id)) throw new ApiError(400, "Invalid id");
};
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const FILTERS = { all: {}, unread: { read: false }, read: { read: true } };
const SEARCH_FIELDS = ["name", "email", "subject", "message"];

/* ---------- public ---------- */

// POST /api/contact (body already validated by contactSchema)
export const submitContactMessage = asyncHandler(async (req, res) => {
  const entry = await ContactMessage.create(req.body);
  console.log("[contact] new message saved:", entry._id.toString());

  // Email alert: fire-and-forget. The message is already safe in MongoDB, so a mail
  // problem never changes the visitor's response.
  void notifyNewMessage(entry);

  res.status(201).json({ success: true, message: "Message received.", data: { id: entry._id } });
});

/* ---------- admin (routes are guarded by requireAdmin) ---------- */

// GET /api/contact
export const listMessages = asyncHandler(async (req, res) => {
  const parsed = messageQuerySchema.safeParse(req.query);
  if (!parsed.success) throw new ApiError(400, "Invalid filter, search or page");
  const { filter, q, page, limit } = parsed.data;

  const where = { ...FILTERS[filter] };
  if (q) {
    const pattern = escapeRegex(q); // user text is never used as a raw regex
    where.$or = SEARCH_FIELDS.map((field) => ({ [field]: { $regex: pattern, $options: "i" } }));
  }

  const [messages, total, unread, totalAll] = await Promise.all([
    ContactMessage.find(where)
      .sort({ receivedAt: -1, _id: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ContactMessage.countDocuments(where),
    ContactMessage.countDocuments({ read: false }),
    ContactMessage.countDocuments(),
  ]);

  res.json({
    success: true,
    data: { messages, total, page, pages: Math.max(1, Math.ceil(total / limit)), unread, totalAll },
  });
});

// PATCH /api/contact/:id   { read: boolean }
export const setRead = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { $set: { read: req.body.read } },
    { returnDocument: "after" }
  );
  if (!message) throw new ApiError(404, "Message not found");
  res.json({ success: true, data: { message } });
});

// POST /api/contact/read-all
export const markAllRead = asyncHandler(async (_req, res) => {
  const result = await ContactMessage.updateMany({ read: false }, { $set: { read: true } });
  res.json({ success: true, data: { updated: result.modifiedCount ?? 0 } });
});

// DELETE /api/contact/:id
export const deleteMessage = asyncHandler(async (req, res) => {
  assertValidId(req.params.id);
  const message = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!message) throw new ApiError(404, "Message not found");
  res.json({ success: true, data: { id: message._id } });
});