import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Node 18+ ya trae fetch, solo lo exponemos
const maybeFetch = (globalThis as any).fetch;
if (!global.fetch && typeof maybeFetch === "function") {
  global.fetch = maybeFetch;
}
