import express, { urlencoded } from 'express';
import type { Request, Response } from 'express';
import session from 'express-session';
import RedisStore from 'connect-redis';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { redisConnection } from "@/config/redis";
import { globalErrorHandler } from "@/response_handler/error_handlers";
import ingestionRoutes from "@/routes/ingestion.routes";
import timelineRoutes from "@/routes/timeline.routes";
import authRoutes from "@/routes/auth.routes";
import viewRoutes from "@/routes/view.routes";

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const hbs = require('hbs');
const sessionStoreMode = (process.env.SESSION_STORE || "memory").toLowerCase();

hbs.registerHelper('eq', (left: unknown, right: unknown) => left === right);

// View engine setup
app.set('views', path.join(process.cwd(), 'src', 'views'));
app.set('view engine', 'hbs');
app.set('view options', { layout: 'layouts/main' });

// Static files
app.use(express.static(path.join(__dirname, '../public')));
app.set("trust proxy", 1);

// Middleware
app.use(express.json());
app.use(urlencoded({ extended: true }));
const sessionStore =
    sessionStoreMode === "redis"
        ? new RedisStore({
              client: redisConnection,
              prefix: "deliverable-bob:sess:",
          })
        : undefined;

app.use(session({
    ...(sessionStore ? { store: sessionStore } : {}),
    secret: process.env.SESSION_SECRET || 'deliverable_bob_secret_key',
    resave: false,
    saveUninitialized: false,
    name: "deliverable_bob.sid",
    cookie: {
        secure: process.env.SESSION_COOKIE_SECURE === 'true' || process.env.NODE_ENV === "production",
        httpOnly: true,
        sameSite: "lax",
    }
}));

// API Routes
app.use("/api/ingest", ingestionRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/auth", authRoutes);

// View Routes
app.use("/", viewRoutes);

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

