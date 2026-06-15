import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

export default defineConfig({
  earlyAccess: true,
  schema: path.join("prisma", "schema.prisma"),

  datasource: {
    url: process.env.DATABASE_URL,
  },

  migrate: {
    async adapter() {
      const { PrismaPg } = await import("@prisma/adapter-pg");
      const { Pool } = await import("pg");

      const connectionString =
        process.env.DIRECT_URL ?? process.env.DATABASE_URL!;

      return new PrismaPg(
        new Pool({
          connectionString,
        }),
      );
    },
  },
});
