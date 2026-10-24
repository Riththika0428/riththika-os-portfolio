import { z } from "zod";

// bcrypt only uses the first 72 bytes, so longer passwords would be silently cut short.
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password").max(200),
    newPassword: z
      .string()
      .min(12, "New password must be at least 12 characters")
      .refine((p) => Buffer.byteLength(p) <= 72, "New password is too long (72 bytes max)"),
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ["newPassword"],
    message: "New password must be different from the current one",
  });