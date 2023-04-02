import { z } from "zod";

const appConfigEnvs = {
  NEXT_PUBLIC_WEBSITE_URL: process.env.NEXT_PUBLIC_WEBSITE_URL,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
};

const appConfigSchema = z.object({
  NEXT_PUBLIC_WEBSITE_URL: z.string().url(),
  NEXT_PUBLIC_SOCKET_URL: z.string().url(),
});

export const appConfig = appConfigSchema.parse(appConfigEnvs);
