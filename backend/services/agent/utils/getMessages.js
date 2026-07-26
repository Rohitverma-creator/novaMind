import axios from "axios";

export const getMesssages = async (conversationId) => {
  try {
    const { data } = await axios.get(
      `${process.env.CHAT_SERVICE}/get-messages/${conversationId}`
    );

    console.log("GET RESPONSE:", data);

    return data;
  } catch (error) {
    console.log("STATUS:", error.response?.status);
    console.log("DATA:", error.response?.data);
    console.log("MESSAGE:", error.message);

    return [];
  }
};