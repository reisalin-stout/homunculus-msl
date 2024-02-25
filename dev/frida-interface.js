const frida = require("frida");
const fs = require("fs");

class FridaInterface {
  constructor(device_id, pid) {
    this.device_id = device_id;
    this.pid = pid;
    this.device = null;
    this.session = null;
    this.script = null;
    this.ready = false;

    this.queue = {};
    this.ids = [];
  }

  async start(scriptPath) {
    try {
      const code = fs.readFileSync(scriptPath).toString();
      this.device = await frida.getDevice(this.device_id);
      this.session = await this.device.attach(this.pid, "emulated");
      this.session.detached.connect(onDetached);

      this.script = await this.session.createScript(code);
      await this.script.load();
      this.ready = true;
      this.script.message.connect(async (data) => {
        try {
          if (typeof data.payload.id !== "undefined") {
            this.queue[data.payload.id] = data.payload.body;
          } else {
            console.log(data.payload);
          }
        } catch (error) {
          console.log(error);
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async send(data, options = {}, { timeout = 20000, refresh = 200 } = {}) {
    const msgId = this.newId();
    this.script.post({
      type: "control",
      payload: { id: msgId, options: options, script: data },
    });
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const requestInterval = setInterval(() => {
        if (this.queue.hasOwnProperty(msgId)) {
          let response = this.queue[msgId];
          delete this.queue[msgId];
          let index = this.ids.indexOf(msgId);
          if (index !== -1) {
            this.ids.splice(index, 1);
          }
          clearInterval(requestInterval);
          resolve({ type: "response", body: response });
        } else {
          attempts++;
          if (attempts * refresh >= timeout) {
            resolve({ type: "response", body: "Request timed out" });
          }
        }
      }, refresh);
    });
  }

  newId() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    while (true) {
      let result = "";
      for (let i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      if (!this.ids.includes(result)) {
        return result;
      }
    }
  }
}

function onDetached(reason) {
  console.log(`[+] Frida Exit Reason: ${reason}`);
}

module.exports = {
  FridaInterface,
};
