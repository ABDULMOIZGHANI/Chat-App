import express from "express";
import cookieparser from "cookie-parser";
import cors from "cors";
import { config } from "dotenv";
import fileupload from "express-fileupload";
import { dbConnection } from "./database/db.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";

const app = express();

config({ path: "./config/config.env" });

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"]
  })
);

app.use(cookieparser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  fileupload({
    useTempFiles: true,
    tempFileDir: "./temp/"
  })
);

app.use("/api/v1/user", userRouter);
app.use("/api/v1/message", messageRouter);

dbConnection();

export default app;
