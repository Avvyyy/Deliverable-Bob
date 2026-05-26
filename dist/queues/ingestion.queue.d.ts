import { Queue } from "bullmq";
declare const INGESTION_QUEUE_NAME = "ingestion-queue";
declare const ingestionQueue: Queue<any, any, string, any, any, string>;
export { ingestionQueue, INGESTION_QUEUE_NAME };
//# sourceMappingURL=ingestion.queue.d.ts.map