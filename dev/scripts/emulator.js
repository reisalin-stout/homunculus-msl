const { log, timestamp, MessageHandler } = require("./system.js");
const { AdbInterface } = require("./adb-interface.js");
const { FridaInterface } = require("./frida-interface.js");
let adb = null;
let frida = null;
// Checks and start
async function checkAdb() {
  try {
    if (adb === null) {
      log("Initializing ADB");
      adb = new AdbInterface(global.MSLEAGUE.config.paths.adb);
      const deviceId = await adb.findDeviceByModel(
        global.MSLEAGUE.config.variables.device_model
      );
      if (!deviceId) {
        adb = null;
        log(
          `Couldn't find device ${global.MSLEAGUE.config.variables.device_model}, make sure the model name is correct`
        );
        return false;
      } else {
        global.MSLEAGUE.config.variables.device_id = deviceId;
        adb.bind(deviceId);
        log(
          `ADB is connected to ${global.MSLEAGUE.config.variables.device_model} with serial ${deviceId}`
        );
      }
    }
    return true;
  } catch (error) {
    adb = null;
    return false;
  }
}

async function checkGame(timeout = 5000) {
  try {
    const isGameRunning = await adb.isProcessRunning(
      global.MSLEAGUE.config.variables.package_name
    );
    let gamePid;
    if (!isGameRunning) {
      gamePid = await adb.executeProcess(
        global.MSLEAGUE.config.variables.package_name
      );
      await new Promise((resolve) => setTimeout(resolve, timeout));
    } else {
      gamePid = await adb.getPidByName(
        global.MSLEAGUE.config.variables.package_name
      );
    }
    global.MSLEAGUE.config.variables.game_pid = gamePid;

    return true;
  } catch (error) {
    return false;
  }
}

async function checkFrida() {
  try {
    if (
      frida === null ||
      frida.pid != global.MSLEAGUE.config.variables.game_pid
    ) {
      log("Initializing Frida");
      frida = new FridaInterface(
        global.MSLEAGUE.config.variables.device_id,
        global.MSLEAGUE.config.variables.game_pid
      );
      log("Frida is now set up");
    }
    let isFridaRunning = await adb.isProcessRunning("frida-server");
    if (!isFridaRunning) {
      const payloadPath = `${global.MSLEAGUE.config.variables.storage_path}frida-server`;
      const doesPayloadExist = await adb.doesFileExist(payloadPath);
      if (!doesPayloadExist) {
        log("Payload doesnt exist, sending it now");
        await adb.sendFile(
          global.MSLEAGUE.config.paths.frida_payload,
          global.MSLEAGUE.config.variables.storage_path
        );
      }
      log("Payload isn't running, starting it now");

      isFridaRunning = await adb.executeFile(payloadPath);
    }
    log("Payload running");
    return isFridaRunning;
  } catch (error) {
    frida = null;
    return false;
  }
}

async function startup() {
  const adbSuccess = await checkAdb();
  if (!adbSuccess) {
    log("Failed to initialize ADB");
    return [false, adb, frida];
  }
  const pidSuccess = await checkGame();
  if (!pidSuccess) {
    log("Game is not running and couldn't start");
    return [false, adb, frida];
  }
  log("Game is running");

  const fridaSuccess = await checkFrida();
  if (!fridaSuccess) {
    log("Failed to initialize Frida");
    return [false, adb, frida];
  }

  return [true, adb, frida];
}

module.exports = {
  startup,
};
