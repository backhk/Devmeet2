import mongoose, { Schema, Document } from "mongoose";

export interface IPost extends Document {
  title: string;
  content: string;
  capacity: number;
  techStack: string[];
  meetingType: "ONLINE" | "OFFLINE" | "HYBRID";
  contactLink?: string;
  status: "RECRUITING" | "COMPLETED";
  author: mongoose.Types.ObjectId;
  createdAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    capacity: { type: Number, required: true },
    techStack: { type: [String], default: [] },
    meetingType: { type: String, enum: ["ONLINE", "OFFLINE", "HYBRID"], required: true },
    contactLink: { type: String, default: "" },
    status: { type: String, enum: ["RECRUITING", "COMPLETED"], default: "RECRUITING" },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Post || mongoose.model<IPost>("Post", PostSchema);