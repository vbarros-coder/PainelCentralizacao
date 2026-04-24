/**
 * Prisma Client Singleton
 * Instância única do Prisma Client para toda a aplicação
 * 
 * NOTA: O Prisma Client será gerado após configurar o DATABASE_URL
 * e rodar 'npx prisma generate'. Por enquanto, exportamos um mock.
 */

// Mock temporário até configurar o banco de dados
const mockPrisma = {
  addvaluEvent: { create: async () => ({}), findMany: async () => [] },
  operationalSnapshot: { create: async () => ({}), findMany: async () => [] },
  projectChangeLog: { create: async () => ({}), findMany: async () => [] },
  addvaluMemory: { create: async () => ({}), findMany: async () => [], update: async () => ({}) },
  proactiveAlert: { create: async () => ({}), findMany: async () => [], update: async () => ({}) },
  conversationSession: { create: async () => ({}), findMany: async () => [] },
  conversationMessage: { create: async () => ({}), findMany: async () => [] },
};

// TODO: Descomentar quando configurar o DATABASE_URL
// import { PrismaClient } from '../generated/prisma';
// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
// export const prisma = globalForPrisma.prisma ?? new PrismaClient();
// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const prisma = mockPrisma as any;
export default prisma;
