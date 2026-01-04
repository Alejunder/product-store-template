import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import productRoutes from "./routes/productRoutes.js";
import { sql } from "./config/db.js";
import { aj } from "./lib/arcjet.js";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const __dirname = path.resolve();

app.use(express.json());
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false,
})); // Security middleware
app.use(morgan("dev")); // Logging middleware

// apply arcjet rate limiting to all routes
app.use(async (req, res, next) => {
  try {
    const decision = await aj.protect(req,{
      requested: 1 // specifies that each request consumes 1 token
    });
    
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({message: "Too many requests"});
      } else if (decision.reason.isBot()) {
        return res.status(403).json({message: "Access denied for bots"});
      } else {
        return res.status(403).json({message: "Forbidden"});
      }
    }
   
    // check for spoofed bots
    if (decision.reason.isBot() && decision.reason.isSpoofed()) {
      return res.status(403).json({message: "Spoofed bot detected"});
    }

    next();
  }  catch (error) {
    console.log("Arcjet error:", error);
    next();
  }
}); 
  
app.use("/api/products", productRoutes);

if (process.env.NODE_ENV === "production") {
  // server our react app
  const staticPath = path.join(__dirname, "frontend/dist");
  app.use(express.static(staticPath));
  
  // Use app.use instead of app.get for catch-all in Express 5
  app.use((req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });
}

async function initiDB() {
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
    console.log("Database init successfully");
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}
initiDB().then(() => {
  app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
  });
});
