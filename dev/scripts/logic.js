const { log, timestamp, MessageHandler } = require("./system.js");
const { startup } = require("./emulator.js");

let adb = null;
let frida = null;
let logicCore = false;

let lines = [];

async function logic(message) {
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
  }

  switch (message.body) {
    case "adb-screenshot":
      log("trying to take screenshot");
      adb.takeScreenshot(
        global.MSLEAGUE.config.paths.screenshot_folder,
        `ss-${timestamp()}`
      );
      return JSON.stringify("All good");

    case "frida-inject":
      await frida.start("./dev/scripts/frida-inject.js", handler);
      log("frida started");
      return JSON.stringify("All good");
    case "find-region":
      let msg = new MessageHandler("find-region");
      frida.send(msg);
      return JSON.stringify("All good");

    case "lookup":
      let newmsg = new MessageHandler(
        "find-astromon",
        JSON.stringify({ uid: "someuid", lv: "somelv" })
      );
      frida.send(newmsg);
      return JSON.stringify("All good");
  }
}

// Other functions

function handler(data) {
  /*  if (Array.isArray(data)) {
    lines.push(...data);
  } else {
    lines.push(data);
  }
*/
  log(JSON.stringify(data.body));
}

async function tick() {
  if (lines.length == 0) {
    return false;
  }
  const oldlines = lines;
  lines = [];
  return oldlines;
}

module.exports = {
  logic,
  tick,
  handler,
};
