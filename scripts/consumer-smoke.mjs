import { spawnSync } from "node:child_process";
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

const packageDir = process.cwd();
const jsdomVersion = JSON.parse(readFileSync(join(packageDir, "package.json"), "utf8"))
  .devDependencies.jsdom;
const nodeExecutable = process.execPath;
const npmCliPath = join(
  dirname(nodeExecutable),
  "..",
  "lib",
  "node_modules",
  "npm",
  "bin",
  "npm-cli.js",
);
const typescriptCliPath = join(packageDir, "node_modules", "typescript", "bin", "tsc");

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const runCommand = (command, args, cwd) => {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    env: process.env,
  });

  return {
    status: result.status ?? 1,
    stderr: result.stderr ?? "",
    stdout: result.stdout ?? "",
  };
};

const runNodeCommand = (args, cwd) => runCommand(nodeExecutable, args, cwd);

const runNpmCommand = (args, cwd) => runNodeCommand([npmCliPath, ...args], cwd);

const createPackedTarball = (cwd, destination) => {
  const packResult = runNpmCommand(["pack", "--pack-destination", destination], cwd);
  assert(packResult.status === 0, `npm pack failed: ${packResult.stderr || packResult.stdout}`);

  const tarball = readdirSync(destination).find((fileName) => fileName.endsWith(".tgz"));
  assert(tarball, "expected packed tarball");

  return join(destination, tarball);
};

const withTempDir = (prefix, run) => {
  const tempDir = mkdtempSync(join(tmpdir(), prefix));

  try {
    return run(tempDir);
  } finally {
    rmSync(tempDir, { force: true, recursive: true });
  }
};

const tests = [
  {
    name: "consumer tarball installs in a temp project",
    run: () =>
      withTempDir("pas-js-consumer-install-", (tempDir) => {
        const tarball = createPackedTarball(packageDir, tempDir);

        writeFileSync(
          join(tempDir, "package.json"),
          JSON.stringify(
            {
              dependencies: {
                "@putdotio/pas-js": `file:${tarball}`,
              },
              name: "pas-js-consumer-install",
              private: true,
              type: "module",
            },
            null,
            2,
          ),
        );

        const installResult = runNpmCommand(["install", "--ignore-scripts"], tempDir);
        assert(
          installResult.status === 0,
          `npm install failed: ${installResult.stderr || installResult.stdout}`,
        );
      }),
  },
  {
    name: "consumer types compile outside the workspace",
    run: () =>
      withTempDir("pas-js-consumer-types-", (tempDir) => {
        const tarball = createPackedTarball(packageDir, tempDir);

        writeFileSync(
          join(tempDir, "package.json"),
          JSON.stringify(
            {
              dependencies: {
                "@putdotio/pas-js": `file:${tarball}`,
              },
              name: "pas-js-consumer-types",
              private: true,
              type: "module",
            },
            null,
            2,
          ),
        );

        writeFileSync(
          join(tempDir, "tsconfig.json"),
          JSON.stringify(
            {
              compilerOptions: {
                module: "NodeNext",
                moduleResolution: "NodeNext",
                noEmit: true,
                strict: true,
                target: "ES2022",
              },
              include: ["consumer.ts"],
            },
            null,
            2,
          ),
        );

        writeFileSync(
          join(tempDir, "consumer.ts"),
          [
            'import createPasClient, { type Config, type PutioAnalyticsClient } from "@putdotio/pas-js";',
            "",
            "const config: Config = {",
            '  apiURL: "https://pas.put.io/api",',
            "  cache: {",
            '    domain: ".put.io",',
            "    expires: 30,",
            "  },",
            "};",
            "",
            "const client: PutioAnalyticsClient = createPasClient(config);",
            "void client;",
            "",
          ].join("\n"),
        );

        const installResult = runNpmCommand(["install", "--ignore-scripts"], tempDir);
        assert(
          installResult.status === 0,
          `npm install failed: ${installResult.stderr || installResult.stdout}`,
        );

        const typecheckResult = runNodeCommand(
          [typescriptCliPath, "--project", "tsconfig.json"],
          tempDir,
        );
        assert(
          typecheckResult.status === 0,
          `consumer typecheck failed: ${typecheckResult.stderr || typecheckResult.stdout}`,
        );
      }),
  },
  {
    name: "consumer runtime import works from the installed package",
    run: () =>
      withTempDir("pas-js-consumer-runtime-", (tempDir) => {
        const tarball = createPackedTarball(packageDir, tempDir);

        writeFileSync(
          join(tempDir, "package.json"),
          JSON.stringify(
            {
              dependencies: {
                "@putdotio/pas-js": `file:${tarball}`,
                jsdom: jsdomVersion,
              },
              name: "pas-js-consumer-runtime",
              private: true,
              type: "module",
            },
            null,
            2,
          ),
        );

        writeFileSync(
          join(tempDir, "runtime.mjs"),
          [
            'import createPasClient from "@putdotio/pas-js";',
            'import { JSDOM } from "jsdom";',
            'const dom = new JSDOM("", { url: "https://app.put.io" });',
            "globalThis.window = dom.window;",
            "globalThis.document = dom.window.document;",
            "try {",
            '  for (const value of [{}, null, 7, "stale", [null, { id: "bad", path: "/events", body: null }]]) {',
            '    document.cookie = "pas_js_retry_queue=" + encodeURIComponent(JSON.stringify(value)) + "; path=/; domain=.put.io";',
            "    const client = createPasClient();",
            '    if (typeof client.track !== "function") throw new Error("Client did not recover");',
            '    const cookie = document.cookie.split("; ").find((value) => value.startsWith("pas_js_retry_queue="));',
            '    if (!cookie || JSON.parse(decodeURIComponent(cookie.split("=")[1])).length !== 0) throw new Error("Malformed retry cookie was not replaced");',
            "  }",
            "} finally { dom.window.close(); }",
            "",
            'if (typeof createPasClient !== "function") {',
            '  throw new Error("default export is not callable");',
            "}",
            "",
            "console.log(JSON.stringify({ ok: true }));",
            "",
          ].join("\n"),
        );

        const installResult = runNpmCommand(["install", "--ignore-scripts"], tempDir);
        assert(
          installResult.status === 0,
          `npm install failed: ${installResult.stderr || installResult.stdout}`,
        );

        const runtimeResult = runNodeCommand(["runtime.mjs"], tempDir);
        assert(
          runtimeResult.status === 0,
          `consumer runtime failed: ${runtimeResult.stderr || runtimeResult.stdout}`,
        );
      }),
  },
  {
    name: "consumer cannot import internal package paths",
    run: () =>
      withTempDir("pas-js-consumer-exports-", (tempDir) => {
        const tarball = createPackedTarball(packageDir, tempDir);

        writeFileSync(
          join(tempDir, "package.json"),
          JSON.stringify(
            {
              dependencies: {
                "@putdotio/pas-js": `file:${tarball}`,
              },
              name: "pas-js-consumer-exports",
              private: true,
              type: "module",
            },
            null,
            2,
          ),
        );

        writeFileSync(
          join(tempDir, "runtime.mjs"),
          [
            "let importError;",
            "",
            "try {",
            '  await import("@putdotio/pas-js/src/client");',
            "} catch (error) {",
            "  importError = error;",
            "}",
            "",
            "if (!importError) {",
            '  throw new Error("internal path import unexpectedly succeeded");',
            "}",
            "",
            "const message = String(importError.code || importError.message || importError);",
            "",
            'if (!message.includes("ERR_PACKAGE_PATH_NOT_EXPORTED") && !message.includes("not exported")) {',
            "  throw new Error(`unexpected internal path error: ${message}`);",
            "}",
            "",
            "console.log(JSON.stringify({ ok: true }));",
            "",
          ].join("\n"),
        );

        const installResult = runNpmCommand(["install", "--ignore-scripts"], tempDir);
        assert(
          installResult.status === 0,
          `npm install failed: ${installResult.stderr || installResult.stdout}`,
        );

        const runtimeResult = runNodeCommand(["runtime.mjs"], tempDir);
        assert(
          runtimeResult.status === 0,
          `consumer export boundary check failed: ${runtimeResult.stderr || runtimeResult.stdout}`,
        );
      }),
  },
];

for (const test of tests) {
  try {
    test.run();
    console.log(`[pass] ${test.name}`);
  } catch (error) {
    console.error(`[fail] ${test.name}`);
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
