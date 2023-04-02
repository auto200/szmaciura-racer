import "dotenv/config";

import { z } from "zod";

export enum AppEnvironment {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
}

const appConfigSchema = z.object({
  PORT: z.preprocess((port) => Number.parseInt(String(port)), z.number().positive()),
  NODE_ENV: z.nativeEnum(AppEnvironment),
  CORS_ORIGIN: z.string().url(),
});

export const appConfig = appConfigSchema.parse(process.env);
