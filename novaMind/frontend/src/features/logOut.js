import api from "../utils/axios";

const logOut = async () => {
  try {
    const { data } = await api.get("/api/auth/logout");
    console.log(data);
    return data;
  } catch (error) {
    console.error(error.response?.data || error.message);
  }
};

export default logOut;
