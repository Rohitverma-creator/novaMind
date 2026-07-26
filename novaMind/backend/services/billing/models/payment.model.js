import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    orderId: {
      type: String,
      required: true,
    },
    paymentId: String,
    amount: Number,
    currency: {
      type: String,
      default: "INR",
    },
    plan: {
      type: String,
    },
    credits: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
    },
  },
  { timestamps: true },
);

const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
