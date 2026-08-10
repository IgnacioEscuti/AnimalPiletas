#!/usr/bin/env node
// REPL driver for AnimalPiletas (chromium-cli is not installed on this
// machine, so this drives a headless Playwright Chromium the same way:
// pipe commands to stdin, one per line).
import { chromium } from "playwright";
import readline from "node:readline";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotDir = path.join(__dirname, "screenshots");
fs.mkdirSync(screenshotDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
const consoleMessages = [];
page.on("console", (msg) => consoleMessages.push({ type: msg.type(), text: msg.text() }));
page.on("pageerror", (err) => consoleMessages.push({ type: "error", text: err.message }));

const rl = readline.createInterface({ input: process.stdin, terminal: false });

async function handle(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return;

  const spaceIdx = trimmed.indexOf(" ");
  const cmd = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
  const arg = spaceIdx === -1 ? "" : trimmed.slice(spaceIdx + 1);

  try {
    switch (cmd) {
      case "nav": {
        await page.goto(arg, { waitUntil: "domcontentloaded" });
        console.log(`OK nav ${arg}`);
        break;
      }
      case "wait-for": {
        // "wait-for text=Algo" or "wait-for css-selector"
        if (arg.startsWith("text=")) {
          await page.waitForSelector(`text=${arg.slice(5)}`, { timeout: 15000 });
        } else {
          await page.waitForSelector(arg, { timeout: 15000 });
        }
        console.log(`OK wait-for ${arg}`);
        break;
      }
      case "click": {
        // "click <selector>" or scoped "click <scope> :: <selector>"
        // ' :: ' (with spaces) is the separator so it never collides
        // with attribute selectors like input[placeholder="a b"].
        const parts = arg.split(" :: ");
        if (parts.length === 1) {
          await page.click(parts[0], { timeout: 10000 });
        } else {
          await page.locator(parts[0]).locator(parts[1]).click({ timeout: 10000 });
        }
        console.log(`OK click ${arg}`);
        break;
      }
      case "fill": {
        // "fill <selector> :: <value>" or scoped "fill <scope> :: <selector> :: <value>"
        const parts = arg.split(" :: ");
        if (parts.length === 2) {
          await page.fill(parts[0], parts[1], { timeout: 10000 });
        } else if (parts.length === 3) {
          await page.locator(parts[0]).locator(parts[1]).fill(parts[2], { timeout: 10000 });
        } else {
          console.log('ERR fill espera "<selector> :: <valor>" o "<scope> :: <selector> :: <valor>"');
          break;
        }
        console.log(`OK fill ${arg}`);
        break;
      }
      case "screenshot": {
        const name = arg || `shot-${Date.now()}`;
        const file = path.join(screenshotDir, name.endsWith(".png") ? name : `${name}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log(`OK screenshot ${file}`);
        break;
      }
      case "text": {
        console.log(await page.textContent("body"));
        break;
      }
      case "console": {
        if (arg === "--errors") {
          console.log(JSON.stringify(consoleMessages.filter((m) => m.type === "error")));
        } else {
          console.log(JSON.stringify(consoleMessages));
        }
        break;
      }
      case "quit": {
        await browser.close();
        process.exit(0);
      }
      default:
        console.log(`ERR comando desconocido: ${cmd}`);
    }
  } catch (error) {
    console.log(`ERR ${error.message}`);
  }
}

// Commands must run in order, one at a time — readline fires "line"
// synchronously for every buffered line as soon as a heredoc is piped
// in, so without this queue concurrent handle() calls race each other
// (e.g. "click" firing before the previous "wait-for" resolved).
let queue = Promise.resolve();
rl.on("line", (line) => {
  queue = queue.then(() => handle(line));
});

rl.on("close", async () => {
  await queue;
  await browser.close();
  process.exit(0);
});
