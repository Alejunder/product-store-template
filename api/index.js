import { createApp, initDB } from "../backend/app.js";

// Initialize database on cold start
initDB();

// Export the Express app as a serverless function
export default createApp();
