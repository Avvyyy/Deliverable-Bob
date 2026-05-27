import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL || (process.env.NODE_ENV === "production" ? "" : "redis://localhost:6379");

if (!redisUrl) {
    throw new Error("REDIS_URL is required in production.");
}

const redisConnection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
});

export { redisConnection };
