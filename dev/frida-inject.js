function toHex32(value, type, littleEndian = true) {
  const buffer = new ArrayBuffer(4);
  const dataView = new DataView(buffer);
  switch (type) {
    case 0:
      dataView.setUint32(0, value, littleEndian);
      break;
    case 1:
      dataView.setFloat32(0, value, littleEndian);
      break;
  }
  const hexValue = dataView
    .getUint32(0, littleEndian)
    .toString(16)
    .toUpperCase()
    .padStart(8, "0");
  const formattedValue = hexValue.match(/.{2}/g).reverse().join(" ");
  return formattedValue;
}

Process.setExceptionHandler(onException);

function onException(error) {
  console.error("Exception:", error);
  return true;
}

recv("control", (message) => {
  receiver(message.payload);
});
function receiver(payload) {
  const injected_options = payload.options ? payload.options : null;
  let response = eval(payload.script);
  send({ id: payload.id, type: "response", body: response });

  recv("control", (message) => {
    receiver(message.payload);
  });
}
