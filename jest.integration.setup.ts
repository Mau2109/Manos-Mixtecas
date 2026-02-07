import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Node 18+ ya trae fetch, solo lo exponemos
if (!global.fetch) {
  global.fetch = fetch;
}