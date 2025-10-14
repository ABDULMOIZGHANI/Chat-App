import mongoose from "mongoose";

export const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "ChatApp"
    })
    .then(() => {
      console.log("database connected");
    })
    .catch((err) => {
      `Error Occurr in conenction of database`;
    });
};
