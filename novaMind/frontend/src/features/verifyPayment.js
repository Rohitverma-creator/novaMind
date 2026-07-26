import api from "../utils/axios";

export const verifyPayment = async (response) => {
  try {
    const { data } = await api.post("/api/billing/verify", response); 
    return data;
  } catch (error) {
    console.log(error);
  }
};