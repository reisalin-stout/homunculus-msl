const { exec } = require("child_process");

class AdbInterface {
  constructor(adbPath, emulatorId = "") {
    this.adbPath = adbPath;
    this.serial = emulatorId;
  }

  static PERMISSIONS = Object.freeze({
    R: 444,
    RW: 644,
    RWX: 755,
  });

  bind(newId) {
    this.serial = newId;
  }

  async adbCommand(arggs) {
    const targetDevice = this.serial.length > 0 ? ` -s ${this.serial}` : "";
    const command = `"${this.adbPath}"${targetDevice} ${arggs}`;

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          if (stderr.includes("device offline")) {
            console.log("device is offline");
            resolve("device is offline");
          } else {
            reject(error);
          }
        } else {
          resolve(stdout.trim());
        }
      });
    });
  }

  async listDevices() {
    try {
      const devices = await this.adbCommand("devices -l");
      const emulatorIDs = devices
        .trim()
        .split("\n")
        .slice(1)
        .map((line) => line.trim().split(/\s+/)[0]);
      console.log("Emulator ID(s):", emulatorIDs);
      return emulatorIDs.length > 0 ? emulatorIDs : [];
    } catch (error) {
      throw error;
    }
  }

  async findDeviceByModel(modelName) {
    const deviceArray = await this.listDevices();
    for (const device in deviceArray) {
      const logger = await this.adbCommand(
        `-s ${deviceArray[device]} shell getprop ro.product.model`
      );
      if (logger == modelName) {
        console.log(
          `device found with model name ${modelName} at ${deviceArray[device]}`
        );
        return deviceArray[device];
      }
    }
    console.log("Couldnt find device with that model");
    return null;
  }

  async getPidByName(processName) {
    try {
      const processes = await this.adbCommand(`shell ps`);
      const lines = processes.trim().split("\n");
      const relativeLine = lines.find((line) => line.includes(processName));

      if (relativeLine) {
        const pid = relativeLine.trim().split(/\s+/)[1];
        return parseInt(pid, 10);
      } else {
        console.log(`Process ${processName} is not running`);
        return null;
      }
    } catch (error) {
      throw error;
    }
  }

  async doesFileExist(filePath) {
    try {
      await this.adbCommand(`shell ls ${filePath}`);
      return true;
    } catch (error) {
      if (error.message.includes("No such file or directory")) {
        return false;
      } else {
        throw error;
      }
    }
  }

  async sendFile(file, path = "/data/local/tmp/") {
    try {
      await this.adbCommand(`push ${file} ${path}"`);
      return;
    } catch (error) {
      throw error;
    }
  }

  async getPermission(filePath) {
    try {
      const permissions = await this.adbCommand(`shell ls -l ${filePath}`);
      const update = permissions.split(" ")[0];
      return update;
    } catch (error) {
      throw error;
    }
  }

  async setPermission(filePath, newPermission = 755) {
    try {
      await this.adbCommand(`shell chmod ${newPermission} ${filePath}`);
      return;
    } catch (error) {
      throw error;
    }
  }

  async executeFile(filePath, su = true, timeout = 1000) {
    const shellCommand = su
      ? `shell su -c "${filePath} > /dev/null 2>&1 &"`
      : `${filePath} &`;
    try {
      const permissions = await this.getPermission(filePath);
      if (permissions != 755) {
        await this.setPermission(filePath, 755);
      }
      await this.adbCommand(shellCommand);
      await new Promise((resolve) => setTimeout(resolve, timeout));
      const isRunning = await this.isProcessRunning(
        filePath.substring(filePath.lastIndexOf("/") + 1)
      );
      return isRunning;
    } catch (error) {
      throw error;
    }
  }

  async takeScreenshot(destination, name) {
    try {
      this.adbCommand(`exec-out screencap -p > ${destination}/${name}.png`);
    } catch (error) {
      throw error;
    }
  }

  async executeProcess(processName, timeout = 30000) {
    try {
      const checkInterval = 500;
      let elapsedTime = 0;
      await this.adbCommand(`shell monkey -p ${processName} 1`);
      return new Promise(async (resolve, reject) => {
        const checkProcess = async () => {
          console.log("Checking process...");
          const pid = await this.getPidByName(processName);

          if (pid !== null && !isNaN(pid)) {
            resolve(parseInt(pid, 10));
          } else if (elapsedTime >= timeout) {
            throw new Error(
              `Timeout: Process ${processName} did not start within ${timeout} ms`
            );
          } else {
            elapsedTime += checkInterval;
            setTimeout(checkProcess, checkInterval);
          }
        };
        checkProcess();
      });
    } catch (error) {
      throw error;
    }
  }

  async isProcessRunning(processName) {
    const pid = await this.getPidByName(processName);
    if (pid !== null && !isNaN(pid)) {
      return true;
    } else {
      return false;
    }
  }
}

module.exports = {
  AdbInterface,
};
