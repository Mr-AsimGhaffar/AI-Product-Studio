import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";

const dir = fileURLToPath(new URL("../migrations/", import.meta.url));

try {
  for (const file of (await readdir(dir))
    .filter((name) => name.endsWith(".sql"))
    .sort()) {
    await pool.query(await readFile(dir + file, "utf8"));
    console.log(`Applied ${file}`);
  }
} finally {
  await pool.end();
}
