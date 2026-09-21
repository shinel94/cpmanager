#!/usr/bin/env node

const { spawnSync } = require("node:child_process");
const path = require("node:path");

const tsxCli = require.resolve("tsx/cli");
const result = spawnSync(
  process.execPath,
  [tsxCli, path.join(__dirname, "seed_wave1.ts"), ...process.argv.slice(2)],
  { stdio: "inherit", env: process.env },
);

process.exit(result.status ?? 1);
