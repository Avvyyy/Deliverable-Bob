import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("DATABASE_URL is required to initialize Prisma.");
}
const prismaClientSingleton = () => {
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({ adapter });
};
const db = globalThis.prisma ?? prismaClientSingleton();
export default db;
if (process.env.NODE_ENV !== 'production')
    globalThis.prisma = db;
//# sourceMappingURL=db.js.map