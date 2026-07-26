import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import router from "./routes/auth.route.js";

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());

connectDB();

app.get("/", (req, res) => {
  res.send("Hello from auth service");
});

app.use("/", router);


app.listen(port, () => {
  console.log(`auth service started at ${port}`);
});