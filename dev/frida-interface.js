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

    this.queue = [];
  }

  async start(scriptPath, handler) {
    try {
      const code = fs.readFileSync(scriptPath).toString();
      this.device = await frida.getDevice(this.device_id);
      this.session = await this.device.attach(this.pid, "emulated");
      this.session.detached.connect(onDetached);

      this.script = await this.session.createScript(code);
      await this.script.load();
      this.ready = true;
      this.script.message.connect(async (data) => {
        let response = await this.receive(data.payload);
        handler(response);
      });
    } catch (error) {
      throw error;
    }
  }

  async send(data) {
    this.script.post({ type: "control", body: data });
  }

  async receive(data) {
    return new Promise();
  }
}

function onDetached(reason) {
  console.log(`[+] Frida Exit Reason: ${reason}`);
}

module.exports = {
  FridaInterface,
};
