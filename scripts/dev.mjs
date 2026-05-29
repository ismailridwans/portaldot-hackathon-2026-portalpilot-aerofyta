// One-command dev: runs the backend (watch) and the Vite web app together.
import { spawn } from "node:child_process";

const targets = [
  { name: "api", color: "\x1b[35m", cmd: "npx", args: ["tsx", "watch", "src/server.ts"] },
  { name: "web", color: "\x1b[36m", cmd: "npm", args: ["--prefix", "app", "run", "dev"] },
];

const children = targets.map(({ name, color, cmd, args }) => {
  const tag = `${color}[${name}]\x1b[0m `;
  const child = spawn(cmd, args, { shell: true, env: process.env });
  const pipe = (stream, out) =>
    stream.on("data", (d) => out.write(d.toString().split("\n").map((l) => (l ? tag + l : l)).join("\n")));
  pipe(child.stdout, process.stdout);
  pipe(child.stderr, process.stderr);
  return child;
});

const shutdown = () => {
  for (const c of children) {
    try { c.kill(); } catch {}
  }
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

console.log("\x1b[32mPortalPilot dev:\x1b[0m  web → http://localhost:5173   api → http://127.0.0.1:8787");
console.log("(make sure a local Portaldot node is running for POT-gas writes — see README)");
