// models/Application.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IApplication extends Document {
  post: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  message: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    post: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    applicant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, default: "" },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"], default: "PENDING" },
  },
  { timestamps: true }
);

export const Application: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>("Application", ApplicationSchema);