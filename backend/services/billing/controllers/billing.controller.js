import axios from "axios";
import crypto from "crypto";
import { PLANS } from "../config/Plans.js";
import razorPay from "../config/razorPay.js";
import Payment from "../models/payment.model.js";

export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.headers["x-user-id"];

    const selectedPlan = PLANS[plan];
    if (!selectedPlan) {
      return res.status(404).json({ message: "plan not found" });
    }

    const order = await razorPay.orders.create({
      amount: selectedPlan.amount * 100,
      currency: "INR",
      receipt: `receipt-${Date.now()}`,
    });

    await Payment.create({
      userId,
      orderId: order.id,
      amount: selectedPlan.amount,
      credits: selectedPlan.credits,
      plan: selectedPlan.id,
      currency: order.currency,
      status: "created",
    });

    return res.status(200).json({
      order,
      plan: selectedPlan,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `create order error ${error}` });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const payment = await Payment.findOne({ orderId: razorpay_order_id });
    if (!payment) {
      return res.status(404).json({ message: "Payment Not Found" });
    }

    payment.status = "paid";
    payment.paymentId = razorpay_payment_id;
    await payment.save();

    await axios.post(`${process.env.AUTH_SERVICE}/update-plan`, {
      userId: payment.userId,
      plan: payment.plan,
      credits: payment.credits,
    });

    return res.status(200).json({ message: "Payment Verified" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: `verify payment error ${error}` });
  }
};