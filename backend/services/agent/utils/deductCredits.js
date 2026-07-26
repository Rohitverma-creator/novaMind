import axios from "axios"
export const deductCredits=async(userId,agent)=>{
    try {
        const { data } = await axios.post(
  `${process.env.AUTH_SERVICE}/deduct-credits`,
  { userId, agent },
  { timeout: 8000 }  
);
        return data
    } catch (error) {
        console.log(error) 
        return null
    }
}