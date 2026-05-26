import express, { urlencoded } from 'express';
import session from 'express-session';
import RedisStore from 'connect-redis';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { redisConnection } from "./config/redis.js";
import { globalErrorHandler } from "./response_handler/error_handlers.js";
import ingestionRoutes from "./routes/ingestion.routes.js";
import timelineRoutes from "./routes/timeline.routes.js";
import authRoutes from "./routes/auth.routes.js";
import viewRoutes from "./routes/view.routes.js";
const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);
const hbs = require('hbs');
hbs.registerHelper('eq', (left, right) => left === right);
// View engine setup
app.set('views', path.join(process.cwd(), 'src', 'views'));
app.set('view engine', 'hbs');
app.set('view options', { layout: 'layouts/main' });
// Static files
app.use(express.static(path.join(__dirname, '../public')));
// Middleware
app.use(express.json());
app.use(urlencoded({ extended: true }));
app.use(session({
    store: new RedisStore({
        client: redisConnection,
        prefix: "deliverable-bob:sess:",
    }),
    secret: process.env.SESSION_SECRET || 'deliverable_bob_secret_key',
    resave: false,
    saveUninitialized: false,
    name: "deliverable_bob.sid",
    cookie: { secure: process.env.SESSION_COOKIE_SECURE === 'true' }
}));
// API Routes
app.use("/api/ingest", ingestionRoutes);
app.use("/api/timeline", timelineRoutes);
app.use("/api/auth", authRoutes);
// View Routes
app.use("/", viewRoutes);
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});
app.use(globalErrorHandler);
app.listen(port, () => {
    console.log(`[SERVER] Bob is listening on port ${port}`);
});
//# sourceMappingURL=app.js.map