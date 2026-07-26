import React, { useEffect, useState } from "react";
import {
  Coins,
  LogOut,
  MessageSquare,
  PanelLeftIcon,
  PenBoxIcon,
  Plus,
  User,
} from "lucide-react";
import { getConversation } from "../features/getConversation";
import { useDispatch, useSelector } from "react-redux";
import {
  addConversation,
  setConversations,
  setSelectedConversation,
} from "../redux/conversationSlice";
import { createConversation } from "../features/createConversation";
import logOut from "../features/logOut";
import { setUserData } from "../redux/userSlice";
import BillingDrawer from "./BillingDrawer";

function SideBar() {
  const [collapsed, setCollapsed] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const dispatch = useDispatch();
  const { conversations, selectedConversation } = useSelector(
    (state) => state.conversation,
  );
  const { userData } = useSelector((state) => state.user);
  useEffect(() => {
    const fetchConversations = async () => {
      const data = await getConversation();

      dispatch(setConversations(data));

      if (data.length > 0) {
        dispatch(setSelectedConversation(data[0]));
      }
    };

    fetchConversations();
  }, [userData?._id]);

  const handleCreateConversation = async () => {
    const data = await createConversation();
    dispatch(addConversation(data));
  };

  if (collapsed) {
    return (
      <>
        <div className="lg:hidden fixed top-3 left-3 z-50 flex flex-col gap-2 bg-[#0d0f14] border border-white/10 rounded-xl p-1.5 shadow-lg">
          <button
            onClick={() => setCollapsed(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <PanelLeftIcon className="w-5 h-5" />
          </button>

          <button
            onClick={handleCreateConversation}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop: original full-height rail, static so it takes up real space and pushes chat content instead of overlapping it */}
        <div className="hidden lg:flex lg:static h-screen w-16 bg-[#0d0f14] border-r border-white/10 flex-col items-center py-4 shrink-0">
          <button
            onClick={() => setCollapsed(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition"
          >
            <PanelLeftIcon className="w-5 h-5" />
          </button>

          <button
            onClick={handleCreateConversation}
            className="flex items-center justify-center w-10 h-10 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Mobile-only backdrop, tap outside to close the drawer */}
      <div
        onClick={() => setCollapsed(true)}
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
      />

      <div className="fixed lg:static inset-y-0 left-0 z-50 w-[270px] max-w-[80vw] h-screen shrink-0 bg-[#0d0f14] border-r border-white/[0.06]">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/[0.06]">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-lg text-slate-500
        hover:text-slate-200 hover:bg-white/[0.05] transition-colors duration-150 bg-transparent border-none cursor-pointer"
              onClick={() => setCollapsed(true)}
            >
              <PanelLeftIcon />
            </div>
            <span className="text-[16px] font-semibold text-slate-100 tracking-tight flex-1 ">
              NovaMind
            </span>
            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white shadow-md">
              Free
            </span>
            <button
              onClick={() => dispatch(setSelectedConversation(null))}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition"
            >
              <PenBoxIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="px-4 pt-4 pb-1">
            <button
              onClick={() => dispatch(setSelectedConversation(null))}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 transition"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">New Chat</span>
            </button>
          </div>
          {conversations.length == 0 ? (
            <div className="flex items-center justify-center py-5 text-sm text-gray-400">
              No recent conversations
            </div>
          ) : (
            <div className="px-3 py-2 text-sm font-medium text-gray-600">
              Recents
            </div>
          )}
          <div className="flex-1 overflow-y-auto px-2.5 py-2 border-t border-gray-200 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {conversations.map((conv) => {
              const isActive = selectedConversation?._id === conv._id;

              return (
                <div
                  key={conv._id}
                  onClick={() => dispatch(setSelectedConversation(conv))}
                  className={`group flex items-center gap-3 w-full px-3 py-2.5 mb-1 rounded-xl cursor-pointer transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-400 hover:bg-[#1b1f27]"
                  }`}
                >
                  <MessageSquare
                    size={16}
                    className={
                      isActive
                        ? "text-white"
                        : "text-gray-500 group-hover:text-gray-300"
                    }
                  />

                  <p className="flex-1 truncate text-sm font-medium">
                    {conv.title}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mx-2.5 h-px bg-white/[0.06]" />
          <div className="px-3.5 py-3.5">
            {userData ? (
              <div className="flex items-center gap-3 rounded-xl px-3 py-3 hover:bg-gray-100 transition-all duration-200 cursor-pointer">
                {userData?.avatar && !imageError ? (
                  <img
                    src={userData.avatar}
                    alt={userData.name}
                    onError={() => setImageError(true)}
                    className="w-11 h-11 rounded-full object-cover border border-gray-200"
                  />
                ) : (
                  <div className="flex items-center justify-center w-11 h-11 rounded-full bg-blue-100 text-blue-600">
                    <User size={20} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">
                    {userData?.name || "User"}
                  </h3>

                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 mt-1">
                    Free Plan
                  </span>

                  <p className="mt-1 text-xs text-gray-500 truncate">
                    {userData?.email}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBilling(true)}
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-yellow-100 text-yellow-600 hover:bg-yellow-200 transition"
                    title="Upgrade"
                  >
                    <Coins size={18} />
                  </button>

                  <button
                    onClick={() => {
                      logOut();
                      dispatch(setUserData(null));
                    }}
                    className="flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition"
                    title="Logout"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <button className="w-full rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-all duration-200 shadow-md">
                Login
              </button>
            )}
          </div>
        </div>

        <BillingDrawer
          open={showBilling}
          onClose={() => setShowBilling(false)}
        />
      </div>
    </>
  );
}

export default SideBar;
