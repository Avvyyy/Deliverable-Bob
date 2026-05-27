import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to initialize Prisma.");
}

const getDatabaseConfig = (url: string) => {
  const parsedUrl = new URL(url);
  const schema = parsedUrl.searchParams.get("schema") || undefined;
  parsedUrl.searchParams.delete("schema");

  return {
    connectionString: parsedUrl.toString(),
    schema,
  };
};

const databaseConfig = getDatabaseConfig(connectionString);

const pool = new Pool({
  connectionString: databaseConfig.connectionString,
  ...(process.env.NODE_ENV === "production" && {
    ssl: { rejectUnauthorized: false },
  }),
});

const prismaClientSingleton = () => {
  const adapter = new PrismaPg(pool, {
    ...(databaseConfig.schema && { schema: databaseConfig.schema }),
  });
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db = globalThis.prisma ?? prismaClientSingleton();

export default db;
export { pool };

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;
