import mongoose, { Schema, model, models } from "mongoose";

const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, default: "기타" },
    capacity: { type: Number, required: true, default: 1 },
    applicantsCount: { type: Number, default: 0 },
    applicants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isSecret: { type: Boolean, default: false },
    password: { type: String, default: "" },
    status: { type: String, enum: ["open", "closed"], default: "open" }, // 모집중 / 마감됨
    contactLink: { type: String, default: "" }, // 기본값을 빈 문자열("")로 변경
  },
  { timestamps: true }
);

export const Post = models.Post || model("Post", PostSchema);