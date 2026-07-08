import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { ROOMS, EXPERIENCES } from "./src/data/havenData";
import { initDb } from "./src/db/connection";

// Import Routers
import adminRouter from "./src/routes/admin";
import bookingsRouter from "./src/routes/bookings";
import chatRouter from "./src/routes/chat";

// Load environment variables
dotenv.config({ path: '.env.local' });

const app = express();
const PORT = 3000;

// Enable JSON parse middleware
app.use(express.json());

// API ROUTE: Get Rooms (Static)
app.get("/api/properties", (req, res) => {
  res.json({ success: true, count: ROOMS.length, data: ROOMS });
});

// API ROUTE: Get Experiences (Static)
app.get("/api/experiences", (req, res) => {
  res.json({ success: true, count: EXPERIENCES.length, data: EXPERIENCES });
});

// Mount modular routers
app.use("/api/admin", adminRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/chat", chatRouter);

// Configure Vite middleware or production serving
async function setupServer() {
  try {
    // Initialize MSSQL Database
    console.log("Initializing database connection...");
    await initDb();
    console.log("Database initialized.");

    if (process.env.NODE_ENV !== "production") {
      // Development Mode
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
      console.log("Mounted Vite development middleware.");
    } else {
      // Production Mode
      const distPath = path.join(process.cwd(), "dist");
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
      console.log("Serving static production assets from /dist.");
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`[Haven Stay Portal Router] Server running live on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

setupServer();
