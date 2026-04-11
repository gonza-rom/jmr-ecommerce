// lib/prisma-devhub.js
import { PrismaClient } from "../../node_modules/.prisma/devhub-client";

const globalForDevhub = globalThis;

export const devhub =
  globalForDevhub.devhubPrisma ??
  new PrismaClient({
    datasources: {
      db: { url: process.env.DEVHUB_DATABASE_URL },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForDevhub.devhubPrisma = devhub;
}

export const JMR_TENANT_ID = process.env.DEVHUB_TENANT_ID;