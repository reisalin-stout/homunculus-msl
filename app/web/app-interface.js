let consolelog;
let root;
let appListener;

class AppListener {
  constructor() {
    Object.defineProperty(this, "command", {
      value: async function (data) {
        const url = root + "app-controller";
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ command: data }),
        })
          .then((response) => response.json())
          .then((result) => {
            this.receiver(result);
          })
          .catch((error) => {
            this.error(error.body);
          });
      },
      writable: false,
      configurable: true,
      enumerable: false,
    });

    Object.defineProperty(this, "script", {
      value: async function (data) {
        const url = root + "script-inject";
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: data }),
        })
          .then((response) => response.json())
          .then((result) => {
            this.scriptResult(result.body);
          })
          .catch((error) => {
            this.error(error.body);
          });
      },
      writable: false,
      configurable: true,
      enumerable: false,
    });

    const eventSource = new EventSource(root + "events");
    eventSource.onmessage = (event) => {
      this.tick(event.data);
    };
  }

  scriptResult(data) {}

  receiver(object) {}

  tick(data) {}

  error(error) {}
}

function clog(msg) {
  let inner = msg;
  if (typeof msg === "object") {
    inner = JSON.stringify(msg);
  }
  consolelog.innerHTML = consolelog.innerHTML + inner + "<br>";
}

document.addEventListener("DOMContentLoaded", function () {
  consolelog = document.getElementById("console");
  root = window.location.href;
  appListener = new AppListener();
  clog(`Using ${root}`);
});
