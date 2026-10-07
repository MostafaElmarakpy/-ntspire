import { spawn } from "node:child_process";
import path from "node:path";

const port = process.argv[2] ?? "3101";
const nextBin = path.resolve("node_modules", "next", "dist", "bin", "next");
const server = spawn(process.execPath, [nextBin, "dev", "--hostname", "127.0.0.1", "--port", port], {
  env: { ...process.env, NTSPIRE_NEXT_DIST_DIR: ".next-playwright-dev" },
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.kill(signal));
}

server.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
