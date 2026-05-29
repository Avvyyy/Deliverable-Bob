import IORedis from "ioredis";

const redisUrl =
    process.env.REDIS_URL ||
    process.env.UPSTASH_REDIS_URL ||
    (process.env.NODE_ENV === "production" ? "" : "redis://localhost:6379");

if (!redisUrl) {
    throw new Error("REDIS_URL is required in production.");
}

const ensureValidRedisUrl = (rawUrl: string) => {
    let parsed: URL;
    try {
        parsed = new URL(rawUrl);
    } catch {
        throw new Error("REDIS_URL is invalid. Expected redis:// or rediss:// URL.");
    }

    if (!["redis:", "rediss:"].includes(parsed.protocol)) {
        throw new Error("REDIS_URL must use redis:// or rediss:// protocol.");
    }

    if (!parsed.hostname) {
        throw new Error("REDIS_URL is missing a hostname.");
    }
};

ensureValidRedisUrl(redisUrl);

const parsedUrl = new URL(redisUrl);
const redisProtocol = parsedUrl.protocol;

const redisConnection = new IORedis({
    host: parsedUrl.hostname,
    port: parsedUrl.port ? parseInt(parsedUrl.port, 10) : 6379,
    username: parsedUrl.username ? decodeURIComponent(parsedUrl.username) : undefined,
    password: parsedUrl.password ? decodeURIComponent(parsedUrl.password) : undefined,
    maxRetriesPerRequest: null,
    connectTimeout: 10000,
    keepAlive: 10000,
    enableReadyCheck: false,
    retryStrategy: (times) => Math.min(times * 200, 5000),
    reconnectOnError: (err) => {
        const message = err.message.toLowerCase();
        if (message.includes("econnreset") || message.includes("readonly")) {
            return 1;
        }
        return false;
    },
    ...(redisProtocol === "rediss:" && { tls: {} }),
});

redisConnection.on("error", (error) => {
    console.error(`[Redis] ${error.message}`);
});

export { redisConnection };
