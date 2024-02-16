const express = require("express");
const { spawn } = require("child_process");
const { logic, tick, start, respondToClient } = require("./dev/logic.js");
const { initialize, log } = require("./dev/system.js");

let messageIds = [];

function newId() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  while (true) {
    let result = "";
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    if (!messageIds.includes(result)) {
      messageIds.push(result);
      break;
    }
  }
  return result;
}

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

    app.post("/app-controller", async (req, res) => {
      res.setHeader("Content-Type", "application/json");
      const responseMessage = await logic(newId(), req.body);
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
      /*
      const intervalId = setInterval(() => {
        (async () => {
          const data = await tick();
          if (data != false) {
            res.write(`data: ${data}\n`);
          }
        })();
      }, global.MSLEAGUE.config.app.refresh);
      */
      req.on("close", () => {
        clearInterval(intervalId);
      });
    });

    const server = app.listen(0, () => {
      global.MSLEAGUE.config.app.port = server.address().port;
      log(
        `Local server listening at address http://127.0.0.1:${global.MSLEAGUE.config.app.port}`
      );
      render();
    });
  } catch (error) {
    log(`ERROR: ${error}`);
  }
}
main();
