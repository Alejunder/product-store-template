import express from "express";
import helmet from "helmet";
import cors from "cors";
import dotenv from "dotenv";

import productRoutes from "./routes/productRoutes.js";
import { sql } from "./config/db.js";
import { aj } from "./lib/arcjet.js";

dotenv.config();

// Arcjet middleware
export const arcjetMiddleware = async (req, res, next) => {
  try {
    const decision = await aj.protect(req, {
      requested: 1
    });
    
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ message: "Too many requests" });
      } else if (decision.reason.isBot()) {
        return res.status(403).json({ message: "Access denied for bots" });
      } else {
        return res.status(403).json({ message: "Forbidden" });
      }
    }
   
    if (decision.reason.isBot() && decision.reason.isSpoofed()) {
      return res.status(403).json({ message: "Spoofed bot detected" });
    }

    next();
  } catch (error) {
    console.log("Arcjet error:", error);
    next();
  }
};

// Initialize database
export async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )     
    `;
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
  }
}

// Create and configure Express app
export function createApp() {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use(helmet({
    contentSecurityPolicy: false,
  }));

  app.use(arcjetMiddleware);
  app.use("/api/products", productRoutes);

  return app;
}
