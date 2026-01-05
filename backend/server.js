import express from "express";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";

import { createApp, initDB } from "./app.js";

dotenv.config();

const app = createApp();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(morgan("dev")); // Logging middleware

if (process.env.NODE_ENV === "production") {
  const staticPath = path.join(__dirname, "frontend/dist");
  app.use(express.static(staticPath));
  
  app.use((req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

initDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
  });
});
