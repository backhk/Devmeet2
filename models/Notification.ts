import mongoose, { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    link: { type: String, default: "" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification =
  models.Notification || model("Notification", NotificationSchema);