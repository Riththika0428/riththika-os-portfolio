import mongoose from "mongoose";

const profileFieldSchema = new mongoose.Schema(
  { key: String, label: String, value: String },
  { _id: false }
);

const journeyEntrySchema = new mongoose.Schema(
  {
    key: String,
    year: String,
    title: String,
    description: String,
    tags: [String],
    now: { type: Boolean, default: false },
  },
  { _id: false }
);

/**
 * Singleton — About page content is site-wide, not a list of records,
 * so this collection is expected to hold exactly one document.
 * Always query with AboutContent.findOne() and upsert on save.
 */
const aboutContentSchema = new mongoose.Schema(
  {
    introParagraphs: [String],
    profileFields: [profileFieldSchema],
    journey: [journeyEntrySchema],
  },
  { timestamps: true }
);

export const AboutContent = mongoose.model("AboutContent", aboutContentSchema);