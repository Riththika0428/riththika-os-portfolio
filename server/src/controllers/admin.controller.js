import { Project } from "../models/Project.js";
import { SkillCategory } from "../models/SkillCategory.js";
import { EducationEntry } from "../models/EducationEntry.js";
import { ContactMessage } from "../models/ContactMessage.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getStats = asyncHandler(async (_req, res) => {
  const [projects, skillCounts, education, totalMessages, unreadMessages] = await Promise.all([
    Project.countDocuments(),
    // skills live as string arrays inside categories, so sum the array lengths
    SkillCategory.aggregate([
      { $group: { _id: null, total: { $sum: { $size: { $ifNull: ["$skills", []] } } } } },
    ]),
    EducationEntry.countDocuments(),
    ContactMessage.countDocuments(),
    ContactMessage.countDocuments({ read: false }),
  ]);

  res.json({
    success: true,
    data: {
      projects,
      skills: skillCounts[0]?.total ?? 0,
      education,
      totalMessages,
      unreadMessages,
    },
  });
});