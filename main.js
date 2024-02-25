const express = require("express");
const { spawn } = require("child_process");
const { logic } = require("./dev/logic.js");
const { initialize, log } = require("./dev/system.js");
const { startup } = require("./dev/emulator.js");
//const { updateFiles } = require("./dev/updater.js");

const fs = require("fs");

function render() {
  log("Starting rendering process");
  const rendererProcess = spawn(global.MSLEAGUE.config.app.renderer, [
    `--port=${global.MSLEAGUE.config.app.port}`,
    `--icon=${global.MSLEAGUE.config.app.icon}`,
    `--title=${global.MSLEAGUE.config.app.title}`,
  ]);
  log("Rendering process started");

  rendererProcess.on("close", async (code) => {
    await log(`Rendering process was closed with code ${code}`);
    await log("Application will close now, goodbye");
    process.exit();
  });
}
let adb = null;
let frida = null;
let logicCore = false;
async function start() {
  if (!logicCore) {
    const [run, adbi, fridai] = await startup();
    if (!run) {
      log("logic core isn't running");
      return;
    }
    adb = adbi;
    frida = fridai;
    logicCore = true;
    log("Logic core running");
    await frida.start("./app/bin/frida/frida-inject.js");
  }
}

async function main() {
  try {
    await initialize();
    log("================================");
    log("Application started, hello");
    const app = express();
    log("Local server started");
    app.use(express.static("./app/web"));
    app.use(express.static("./app/data"));
    app.use(express.json());

    await start();

    app.post("/script-inject", async (req, res) => {
      res.setHeader("Content-Type", "application/json");
      const code = fs.readFileSync(`./app/inject/${req.body.name}.js`).toString();
      const responseMessage = await frida.send(code, req.body.options);
      res.send(responseMessage);
    });

    app.get("/events", (req, res) => {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");
      res.write(`data: "Connected"\n\n`);
      respondToClient = (data) => {
        res.write(`data: ${data}\n`);
      };
      const intervalId = setInterval(() => {
        (async () => {
          const data = false;
          if (data != false) {
            res.write(`data: ${data}\n`);
          }
        })();
      }, global.MSLEAGUE.config.app.refresh);

      req.on("close", () => {
        clearInterval(intervalId);
      });
    });

    const server = app.listen(0, () => {
      global.MSLEAGUE.config.app.port = server.address().port;
      log(`Local server listening at address http://127.0.0.1:${global.MSLEAGUE.config.app.port}`);
      render();
    });
  } catch (error) {
    log(`ERROR: ${error}`);
  }
}
main();
