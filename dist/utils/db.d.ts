import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
declare const prismaClientSingleton: () => PrismaClient<{
    adapter: PrismaPg;
}, never, import("@prisma/client/runtime/client").DefaultArgs>;
declare global {
    var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}
declare const db: PrismaClient<{
    adapter: PrismaPg;
}, never, import("@prisma/client/runtime/client").DefaultArgs>;
export default db;
//# sourceMappingURL=db.d.ts.map