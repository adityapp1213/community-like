import mongoose from "mongoose";

const { Schema, model } = mongoose;
const timestamps = { timestamps: true, versionKey: false };

const userSchema = new Schema(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },
    name: { type: String, required: true, trim: true },
    handle: { type: String, required: true, trim: true, unique: true },
    image: { type: String, default: "" },
    banner: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 180 },
    affiliation: { type: String, default: "", maxlength: 120 },
    contact: { type: String, default: "", maxlength: 180 },
    experience: {
      type: [
        new Schema(
          {
            role: { type: String, default: "", maxlength: 100 },
            organization: { type: String, default: "", maxlength: 120 },
            period: { type: String, default: "", maxlength: 80 },
            location: { type: String, default: "", maxlength: 120 },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    education: {
      type: [
        new Schema(
          {
            school: { type: String, default: "", maxlength: 140 },
            degree: { type: String, default: "", maxlength: 120 },
            period: { type: String, default: "", maxlength: 80 },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    skills: {
      type: [{ type: String, trim: true, maxlength: 60 }],
      default: [],
    },
  },
  timestamps,
);

const projectSchema = new Schema(
  {
    author: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 90 },
    text: { type: String, required: true, trim: true, maxlength: 500 },
    location: { type: String, default: "", maxlength: 100 },
    image: { type: String, default: "" },
  },
  timestamps,
);

const eventSchema = new Schema(
  {
    host: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 90 },
    category: { type: String, default: "Workshop" },
    date: { type: Date, required: true },
    location: { type: String, required: true, maxlength: 120 },
    text: { type: String, required: true, maxlength: 500 },
    image: { type: String, default: "" },
  },
  timestamps,
);

const interactionSchema = new Schema(
  {
    userId: { type: String, required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
  },
  timestamps,
);
interactionSchema.index({ userId: 1, targetId: 1 }, { unique: true });

const commentSchema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, required: true, index: true },
    userId: { type: String, required: true },
    text: { type: String, required: true, trim: true, maxlength: 500 },
  },
  timestamps,
);

const friendshipSchema = new Schema(
  {
    userId: { type: String, required: true },
    friendId: { type: String, required: true },
  },
  timestamps,
);
friendshipSchema.index({ userId: 1, friendId: 1 }, { unique: true });

const followSchema = new Schema(
  {
    userId: { type: String, required: true },
    targetUserId: { type: String, required: true },
  },
  timestamps,
);
followSchema.index({ userId: 1, targetUserId: 1 }, { unique: true });

export const User = model("User", userSchema);
export const Project = model("Project", projectSchema);
export const Event = model("Event", eventSchema);
export const Like = model("Like", interactionSchema);
export const SavedProject = model("SavedProject", interactionSchema);
export const RSVP = model("RSVP", interactionSchema);
export const Share = model("Share", interactionSchema);
export const Comment = model("Comment", commentSchema);
export const Friendship = model("Friendship", friendshipSchema);
export const Follow = model("Follow", followSchema);
