import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Crown, Wind } from "lucide-react";
import { useSelector } from "react-redux";
import { createOrder } from "../features/createOrder.js";
import { verifyPayment } from "../features/verifyPayment.js";

function BillingDrawer({ open, onClose }) {
  const { userData } = useSelector((state) => state.user);

  const handleUpgrade = async (plan) => {
    try {
      const data = await createOrder({ plan });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: "NovaMind",
        description: `${data.plan.name} Plan`,
        order_id: data.order.id,
        handler: async (response) => {
          try {
            const result = await verifyPayment(response);
            console.log("Verified:", result);

            onClose();
          } catch (error) {
            console.log("Verification failed:", error);
          }
        },
        theme: {
          color: "#4F46E5",
        },
      };
      const razorPay = new window.Razorpay(options);
      razorPay.open();
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 30,
            }}
            className="fixed top-0 right-0 z-50 h-screen w-full max-w-md bg-[#111827] border-l border-white/10 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <h2 className="text-xl font-semibold text-white">
                Billing & Plans
              </h2>

              <button
                onClick={onClose}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Current Plan Card */}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Current Plan</p>

                    <h3 className="mt-1 text-2xl font-bold capitalize text-white">
                      {userData?.plan || "Free"}
                    </h3>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 shadow-lg">
                    <Crown className="h-7 w-7 text-white" />
                  </div>
                </div>

                {/* Credits */}
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-slate-400">Credits</span>

                    <span className="text-sm font-semibold text-white">
                      {userData?.credits || 0} / {userData?.totalCredits || 100}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 transition-all duration-700"
                      style={{
                        width: `${
                          ((userData?.credits || 0) /
                            (userData?.totalCredits || 100)) *
                          100
                        }%`,
                      }}
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-500">
                    {userData?.credits || 0} credits remaining
                  </p>
                </div>
              </div>

              {/* Plan Features */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-all duration-300 hover:border-indigo-500 hover:bg-white/10">
                  <p className="text-lg font-semibold text-white">Starter</p>

                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-3xl font-bold text-white">₹199</span>
                    <span className="mb-1 text-sm text-gray-400">/month</span>
                  </div>

                  <p className="mt-3 text-sm font-medium text-green-400">
                    500 Credits
                  </p>

                  <button
                    className="mt-6 w-full rounded-xl bg-indigo-600 py-2.5 font-medium text-white transition hover:bg-indigo-700"
                    onClick={() => handleUpgrade("starter")}
                  >
                    Upgrade Starter
                  </button>
                </div>

                {/* Pro */}
                <div className="relative rounded-2xl border-2 border-violet-500 bg-violet-500/10 p-5 transition-all duration-300 hover:scale-[1.02]">
                  <span className="absolute right-3 top-3 rounded-full bg-violet-600 px-2 py-1 text-[10px] font-semibold text-white">
                    POPULAR
                  </span>

                  <p className="text-lg font-semibold text-white">Pro</p>

                  <div className="mt-2 flex items-end gap-1">
                    <span className="text-3xl font-bold text-white">₹499</span>
                    <span className="mb-1 text-sm text-gray-400">/month</span>
                  </div>

                  <p className="mt-3 text-sm font-medium text-green-400">
                    2000 Credits
                  </p>

                  <button
                    className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 font-medium text-white transition hover:opacity-90"
                    onClick={() => handleUpgrade("pro")}
                  >
                    Upgrade Pro
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default BillingDrawer;
