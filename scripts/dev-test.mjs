// Startet den Dev-Server gegen die separate Test-Supabase-Instanz statt
// gegen die Produktivdatenbank. Lädt .env.test manuell (kein next-eigener
// Mechanismus lädt .env.test für "next dev" -- NODE_ENV bleibt dort immer
// "development"), damit kein zusätzliches npm-Paket nötig ist.
import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const envPath = path.resolve(process.cwd(), ".env.test");

if (!existsSync(envPath)) {
  console.error(
    '.env.test fehlt. Siehe CLAUDE.md, Abschnitt "Testumgebung", für die Einrichtung ' +
      "(Vorlage: .env.test.example)."
  );
  process.exit(1);
}

const env = { ...process.env };
for (const line of readFileSync(envPath, "utf-8").split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq === -1) continue;
  const key = trimmed.slice(0, eq).trim();
  const value = trimmed
    .slice(eq + 1)
    .trim()
    .replace(/^["']|["']$/g, "");
  env[key] = value;
}

console.log(`→ Dev-Server gegen Test-Datenbank (${env.NEXT_PUBLIC_SUPABASE_URL ?? "?"}), Port 3100`);

const child = spawn("npx", ["next", "dev", "-p", "3100"], {
  stdio: "inherit",
  env,
  shell: true,
});
child.on("exit", (code) => process.exit(code ?? 0));
