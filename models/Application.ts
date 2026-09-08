import mongoose, { Schema, Document } from "mongoose";

export interface IApplication extends Document {
  postId: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  message: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: Date;
}

const ApplicationSchema = new Schema<IApplication>(
  {
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    applicant: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["PENDING", "ACCEPTED", "REJECTED"], default: "PENDING" },
  },
  { timestamps: true }
);

// 동일 유저의 중복 신청 방지를 위한 복합 인덱스
ApplicationSchema.index({ postId: 1, applicant: 1 }, { unique: true });

export default mongoose.models.Application || mongoose.model<IApplication>("Application", ApplicationSchema);