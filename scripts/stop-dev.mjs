import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const cwd = process.cwd();
const DEV_MARKERS = [
  `${cwd}/node_modules/.bin/concurrently -k -n VITE,HUGO`,
  "hugo server -D --disableFastRender",
  "vite build --watch --mode development",
];

function isRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function waitForExit(pid, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!isRunning(pid)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  return !isRunning(pid);
}

function sortBySpecificity(processes) {
  return [...processes].sort((a, b) => {
    if (a.command.length !== b.command.length) {
      return b.command.length - a.command.length;
    }
    return b.pid - a.pid;
  });
}

const { stdout } = await execFileAsync("ps", ["-axo", "pid=,command="], {
  cwd,
});

const processes = stdout
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const match = line.match(/^(\d+)\s+(.*)$/);
    if (!match) {
      return null;
    }
    return { pid: Number.parseInt(match[1], 10), command: match[2] };
  })
  .filter(Boolean);

const targets = sortBySpecificity(
  processes.filter((processInfo) =>
    DEV_MARKERS.some((marker) => processInfo.command.includes(marker)),
  ),
);

if (targets.length === 0) {
  console.log("No website dev processes found.");
  process.exit(0);
}

for (const target of targets) {
  try {
    process.kill(target.pid, "SIGTERM");
  } catch (error) {
    if (error.code !== "ESRCH") {
      throw error;
    }
  }
}

const stubborn = [];
for (const target of targets) {
  const exited = await waitForExit(target.pid, 2000);
  if (!exited) {
    stubborn.push(target);
  }
}

for (const target of stubborn) {
  try {
    process.kill(target.pid, "SIGKILL");
  } catch (error) {
    if (error.code !== "ESRCH") {
      throw error;
    }
  }
}

const killed = targets.map((target) => `${target.pid}`).join(", ");
if (stubborn.length > 0) {
  const forced = stubborn.map((target) => `${target.pid}`).join(", ");
  console.log(`Stopped website dev processes: ${killed}. Forced: ${forced}.`);
} else {
  console.log(`Stopped website dev processes: ${killed}.`);
}
