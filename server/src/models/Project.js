import mongoose from "mongoose";
import { PROJECT_STATUSES } from "../config/constants.js";

const metricSchema = new mongoose.Schema(
  { label: String, value: String, caption: String },
  { _id: false }
);

const processStepSchema = new mongoose.Schema(
  { title: String, description: String },
  { _id: false }
);

const challengeSchema = new mongoose.Schema(
  { challenge: String, solution: String },
  { _id: false }
);

const caseStudySchema = new mongoose.Schema(
  {
    metrics: [metricSchema],
    overview: String,
    problem: String,
    goal: String,
    solution: String,
    features: [String],
    techStack: {
      frontend: [String],
      backend: [String],
      database: [String],
    },
    architecture: {
      summary: String,
      layers: [String],
    },
    process: [processStepSchema],
    challenges: [challengeSchema],
    results: [String],
    screenshots: [String],
  },
  { _id: false }
);

const projectSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    featured: { type: Boolean, default: false },
    image: { type: String, default: null },
    description: { type: String, required: true },
    shortDescription: { type: String, trim: true, default: "" },
    status: { type: String, enum: PROJECT_STATUSES },
    stack: [String],
    githubUrl: String,
    liveUrl: String,
    year: Number,
    order: { type: Number, default: 0 },
    caseStudy: caseStudySchema,
  },
  { timestamps: true }
);

export const Project = mongoose.model("Project", projectSchema);