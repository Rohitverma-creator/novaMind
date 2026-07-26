import { signInWithPopup } from "firebase/auth";
import React from "react";
import { auth, googleProvider } from "../utils/firebase";
import api from "../utils/axios";
import { FcGoogle } from "react-icons/fc";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice";
import SideBar from "../component/SideBar";
import ChatArea from "../component/ChatArea";
import ArtEffect from "../component/ArtEffect";

const Home = () => {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const handleLogin = async (token) => {
    try {
      const { data } = await api.post("/api/auth/login", { token });
      dispatch(setUserData(data));
    } catch (error) {
      console.log(error);
    }
  };
  const googleLogin = async () => {
    const data = await signInWithPopup(auth, googleProvider);
    const token = await data.user.getIdToken();
    await handleLogin(token);
    console.log(token);
  };
  return (
    <div className="h-screen flex bg-[#0d0f14] text-white overflow-hidden ">
      <SideBar />
      <ChatArea />
      <ArtEffect />
      {!userData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur">
          <div className="w-[340px] bg-[#13151c] border border-white/[0.08] rounded-2xl p-7 flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-[17px] font-semibold text-slate-100 tracking-tight ">
                Welcome to NovaMind
              </h2>
              <p className="text-[13px] text-slate-500 ">
                Please Login to continue using the app
              </p>
            </div>
            <button
              onClick={googleLogin}
              className="flex items-center justify-center gap-2 w-full max-w-xs px-4 py-2 rounded-lg bg-fuchsia-600 text-white font-medium hover:bg-fuchsia-700 shadow-md transition duration-200 cursor-pointer"
            >
              <FcGoogle size={20} className="bg-white rounded-full p-0.5" />
              <span className="capitalize">Continue with Google</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
