import { existsSync } from "node:fs";
import { config } from "dotenv";

config();

if (existsSync(".env.local")) {
  config({ path: ".env.local", override: true });
}
