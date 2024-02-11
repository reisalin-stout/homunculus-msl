const express = require("express");
const { spawn } = require("child_process");
const { logic, tick } = require("./dev/logic.js");
const { initialize, log, MessageHandler } = require("./dev/system.js");

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
    log(
      "===================================================================================================="
    );
    log("Application started, hello");
    const app = express();
    log("Local server started");
    app.use(express.static("./app/web"));
    app.use(express.json());

    app.post("/app-controller", async (req, res) => {
      log(`Processing a request with body ${req.body}`);
      const msg = new MessageHandler(req.body.type, req.body.body);
      const responseMessage = await logic(msg);
      res.send(responseMessage);
    });

    app.get("/events", (req, res) => {
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      res.write("data: Connected\n\n");

      const intervalId = setInterval(() => {
        (async () => {
          const data = await tick();
          const eventData = `data: ${data}\n\n`;
          res.write(eventData);
        })();
      }, 1000);

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
