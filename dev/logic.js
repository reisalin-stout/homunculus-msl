const { log, timestamp, MessageHandler } = require("./system.js");
const { startup } = require("./emulator.js");

let adb = null;
let frida = null;
let logicCore = false;

let lines = [];
let responses = [];
async function adbScreenshot() {
  adb.takeScreenshot(
    global.MSLEAGUE.config.paths.screenshot_folder,
    `ss-${timestamp()}`
  );
  return { type: "response", body: "Screenshot Taken" };
}

async function sendScript() {
  return new Promise((resolve, reject) => {
    // Set timeout to reject promise after 20 seconds
    const timeout = setTimeout(() => {
      reject(new Error("Timeout: No response received from Frida script"));
    }, 20000);
    // Listen for response with the same ID
    frida.on("message", (message) => {
      if (message.id === id) {
        clearTimeout(timeout); // Clear timeout
        resolve({ type: "response", body: "Script started" });
      }
    });
  });

  let msg = { type: "find-region" };
  frida.send(msg);
  return { type: "response", body: "Script started" };
}

async function logic(id, message) {
  log(`Processing command: ${message.command}`);
  let response;
  switch (message.command) {
    case "adb-screenshot":
      response = await adbScreenshot();
      break;
    case "find-region":
      response = await sendScript();
      break;
    case "load":
      const fs = require("fs/promises");
      await fs
        .readFile("./app/data/astromondump.json", "utf-8")
        .then((data) => {
          const arrayFromFile = JSON.parse(data);
          response = {
            type: "response",
            body: arrayFromFile,
          };
        });
      break;
    default:
      response = "Failed to process command";
      break;
  }
  return response;
}

var respondToClient = (message) => {};

// Other functions
let uid_found = [];
function handler(data) {
  if (typeof data === "undefined") {
    console.log("Error: Script returned 'undefined'");
    return;
  }
  switch (data.type) {
    case "found-astromon":
      log(JSON.stringify(data.body));
      break;
    case "response":
      log(data.body);
      break;
    case "astromon-inventory":
      log("loading astromon inventory");
      respondToClient({ type: "astromon-inventory", body: "some body" });
      return;
    default:
      return;
  }
  /*
    const dict = global.MSLEAGUE.localDB.data;
    const str = data.body;
    const id = parseInt(str.match(/\b\d+\b/)[0]);
    Object.keys(dict).forEach((slug) => {
      Object.keys(dict[slug]).forEach((element) => {
        Object.keys(dict[slug][element]).forEach((evolution) => {
          if (id == dict[slug][element][evolution].uid) {
            let output = `Uid ${id} is a ${slug} evo ${evolution} ${element}`;
            console.log(output);
            log(output);
          }
        });
      });
    });*/
}

async function tick() {
  if (lines.length == 0) {
    return false;
  }
  const oldlines = lines;
  lines = [];
  const data = oldlines
    .map((element) => JSON.stringify(element) + "\n")
    .join("");

  return data;
}

module.exports = {
  logic,
  tick,
  handler,
  respondToClient,
};
