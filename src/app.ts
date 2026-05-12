import express, { urlencoded } from 'express';
import { globalErrorHandler } from "@/response_handler/error_handlers";
import ingestionRoutes from "@/routes/ingestion.routes";
import timelineRoutes from "@/routes/timeline.routes";
import "@/workers/ingestion.worker";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(urlencoded({ extended: true }));

app.use("/api/ingest", ingestionRoutes);
app.use("/api/timeline", timelineRoutes);

app.get('/', (req, res) => {
  res.send('Bob is here to help you stay organised!');
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(globalErrorHandler);

app.listen(port, () => {
  console.log(`[SERVER] Bob is listening on port ${port}`);
});
