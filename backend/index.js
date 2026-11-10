import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import "dotenv/config";
import Db_connection from "./config/Mongodb.js";
import authRouter from "./routes/auth_routes.js";
import userRouter from "./routes/user_routes.js";
import courseRouter from "./routes/course_routes.js";
import adminRouter from "./routes/admin_routes.js";
import compilerRouter from "./routes/compiler_routes.js";
import resultRouter from "./routes/result_routes.js";
import hackathonRouter from "./routes/hackathon_routes.js";
import codingRouter from "./routes/coding_routes.js";
import paymentRouter from "./routes/payment_routes.js";
import paymentHistoryRouter from "./routes/payment_history_routes.js";
import tutorAssignmentRouter from "./routes/tutor_assignment_routes.js";
import tutorRouter from "./routes/tutor_routes.js";
import contactRouter from "./routes/contact_routes.js";
import progressRouter from "./routes/progress_routes.js";
import moduleAssignmentRouter from "./routes/module_assignment_routes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

Db_connection();

const allowedOrigins = ["http://localhost:5174", "http://localhost:5173"];
// const allowedOrigins = ["http://localhost:5174", "http://localhost:5173","http://3.108.200.101:4000", "https://skyinten.com",
//     "https://www.skyinten.com"];

// allow larger JSON/urlencoded bodies, useful when receiving metadata alongside uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));
// block any direct browser request to video files; they must go through the authenticated stream endpoint
app.use('/uploads/videos', (req, res) => {
    // simply refuse with 403 so that long‑pressing a link won't reveal the file
    return res.sendStatus(403);
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- API routes ---
app.use("/api", authRouter);
app.use("/api", userRouter);
app.use("/api", courseRouter);
app.use("/api", adminRouter);
app.use("/api", compilerRouter);
app.use("/api", resultRouter);
app.use("/api/hackathon", hackathonRouter);
app.use("/api", codingRouter);
app.use("/api", paymentRouter);
app.use("/api/payment-history", paymentHistoryRouter);
app.use("/api/tutor-assignment", tutorAssignmentRouter);
app.use("/api/tutor", tutorRouter);
app.use("/api", contactRouter);
app.use("/api/progress", progressRouter);
app.use("/api/module-assignment", moduleAssignmentRouter);

// Serve frontend build if present (backend/build)
const buildPath = path.join(__dirname, "build");
app.use(express.static(buildPath));

// SPA fallback for non-API routes
// Use a RegExp to match any path that does NOT start with /api — avoids path-to-regexp errors
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});