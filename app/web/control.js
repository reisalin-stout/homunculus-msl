let consolelog;
let root;
let endpoint = "app-controller";

class MessageHandler {
  constructor(msgType = "message", msgBody = null) {
    this.type = msgType;
    this.body = msgBody;
  }

  get() {
    return { type: this.type, body: this.body };
  }
}

function log(message) {
  consolelog.innerHTML = consolelog.innerHTML + message + "<br>";
}

document.addEventListener("DOMContentLoaded", function () {
  consolelog = document.getElementById("console");
  root = window.location.href;
  log(root);

  const eventSource = new EventSource(`${root}events`);

  eventSource.onmessage = function (event) {
    receiver(event);
    if (event.data != "false") {
      log(JSON.parse(event.data));
    }
  };
});

function sendData(data) {
  const url = root + endpoint;
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      receiver(result);
    })
    .catch((error) => {
      onError(error);
    });
}

function fetchData() {
  const url = root + endpoint;
  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((result) => {
      receiver(result);
    })
    .catch((error) => {
      onError(error);
    });
}

async function command(action) {
  log(`Trying to ${action}`);
  const package = {
    type: "command",
    body: action,
  };
  sendData(package);
}

async function receiver(message) {
  if (message.type == "astromon-region") {
    // Create table
    const table = document.createElement("table");

    // Create table header
    const headerRow = document.createElement("tr");
    for (const key in message.body[0]) {
      const th = document.createElement("th");
      th.textContent = key;
      headerRow.appendChild(th);
    }
    table.appendChild(headerRow);

    // Create table rows and cells
    message.body.forEach((obj) => {
      const row = document.createElement("tr");
      for (const key in obj) {
        const cell = document.createElement("td");
        cell.textContent = obj[key];
        if (key === "address") {
          cell.classList.add("address");
        } else if (key === "v_dword") {
          cell.classList.add("dword");
        } else if (key === "v_float") {
          cell.classList.add("float");
        }
        row.appendChild(cell);
      }
      table.appendChild(row);
    });

    // Append table to the body
    document.body.appendChild(table);
  }
}

async function onError(message) {
  log(message);
}

function memory() {
  const url = root + "memory-dump";

  setInterval(() => {
    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        // Clear previous table
        const existingTable = document.querySelector("table");
        if (existingTable) {
          existingTable.remove();
        }

        const table = document.createElement("table");

        const headerRow = document.createElement("tr");
        for (const key in data[0]) {
          const th = document.createElement("th");
          th.textContent = key;
          headerRow.appendChild(th);
        }
        table.appendChild(headerRow);

        data.forEach((obj) => {
          const row = document.createElement("tr");
          for (const key in obj) {
            const cell = document.createElement("td");
            cell.textContent = obj[key];
            if (key === "address") {
              cell.classList.add("address");
            } else if (key === "v_dword") {
              cell.classList.add("dword");
            } else if (key === "v_float") {
              cell.classList.add("float");
            }
            row.appendChild(cell);
          }
          table.appendChild(row);
        });

        document.body.appendChild(table);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      });
  }, 5000);
}

function connect() {}
