const fsp = require("fs/promises");

class MessageHandler {
  constructor(msgType = "message", msgBody = null) {
    this.type = msgType;
    this.body = msgBody;
  }

  get() {
    return { type: this.type, body: this.body };
  }
}

async function loadConfig() {
  try {
    global.MSLEAGUE.config = {};
    const configFile = await fsp.readFile(path("app/web/config.json"));
    global.MSLEAGUE.config = JSON.parse(configFile);
  } catch (error) {
    throw error;
  }
}

async function checkVersion() {
  if (global.MSLEAGUE.config.app.version === "1.0.0") {
  }
  return false;
}

async function update() {
  return;
}

function path(target) {
  const origin = process.cwd();
  const forward = origin.replace(/\\/g, "/");
  return forward + "/" + target;
}

async function recursivePathCheck(pathsObject, pathsNotFound = []) {
  const keys = Object.keys(pathsObject);
  if (keys.length === 0) {
    throw new Error(`No paths selected!`);
  }

  for (const key of keys) {
    const value = pathsObject[key];

    if (typeof value === "string") {
      try {
        await fsp.access(path(value));
        pathsObject[key] = path(value);
      } catch (error) {
        pathsNotFound.push(path(value));
      }
    } else if (typeof value === "object") {
      await recursivePathCheck(value, pathsNotFound);
    }
  }
  return pathsNotFound;
}

async function checkPaths(paths) {
  try {
    const pathsNotFound = await recursivePathCheck(paths);
    if (pathsNotFound.length > 0) {
      throw new Error(
        `Some files not found, ensure they are present: ${pathsNotFound.join(
          ", "
        )}`
      );
    } else {
      return;
    }
  } catch (error) {
    throw error;
  }
}

async function loadDatabase() {
  try {
    global.MSLEAGUE.localDB = {};
    const localDatabase = await fsp.readFile(
      global.MSLEAGUE.config.paths.astromon_data
    );
    global.MSLEAGUE.localDB.data = JSON.parse(localDatabase);
    const allFamilies = await fsp.readFile(
      global.MSLEAGUE.config.paths.astromon_families
    );
    global.MSLEAGUE.localDB.families = JSON.parse(allFamilies);
  } catch (error) {
    throw error;
  }
}

async function setTitle() {
  process.title = global.MSLEAGUE.config.app.title;
  global.MSLEAGUE.config.app.icon = path(global.MSLEAGUE.config.app.icon);
}

async function initialize() {
  try {
    global.MSLEAGUE = {};
    await loadConfig();
    const update = await checkVersion();
    if (update) {
      await update();
    }
    await setTitle();

    await checkPaths(global.MSLEAGUE.config.paths);
    await loadDatabase();
  } catch (error) {
    throw error;
  }
}

async function log(message) {
  try {
    const now = new Date();
    const data = now.toISOString().split("T");
    const logname = `/log-${data[0]}.txt`;
    const timestamp = data[1].split(".")[0];
    const filePath = global.MSLEAGUE.config.paths.log_folder + logname;
    const newLine = `${timestamp} - ${message}\n`;
    await fsp.appendFile(filePath, newLine);
  } catch (error) {}
}

async function out(message) {
  try {
    const now = new Date();
    const data = now.toISOString().split("T");
    const logname = `/out-${data[0]}.txt`;
    const filePath = global.MSLEAGUE.config.paths.out_folder + logname;
    await fsp.appendFile(filePath, message);
  } catch (error) {}
}

function timestamp() {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/[T:.]/g, "-")
    .replace(/[Z]/g, "");
  return timestamp;
}
timestamp();
module.exports = {
  initialize,
  log,
  out,
  timestamp,
  MessageHandler,
};
