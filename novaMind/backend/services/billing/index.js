import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import router from "./routes/billing.routes.js";

dotenv.config();

const port = process.env.PORT || 5000;
const app = express();
app.use(express.json());
connectDB();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.use("/", router);




app.get("/", (req, res) => {
  res.send("Hello from billing service");
});
app.listen(port, () => {
  console.log(`billing service started at ${port}`);
});
