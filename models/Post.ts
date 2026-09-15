// models/Post.ts
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
    isSecret: { type: Boolean, default: false }, // 비밀글 여부
    password: { type: String, default: "" }, // 비밀글 비밀번호
  },
  { timestamps: true }
);

export const Post = models.Post || model("Post", PostSchema);