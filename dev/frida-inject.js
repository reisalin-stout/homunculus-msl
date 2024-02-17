recv("control", (message) => {
  receiver(message.payload);
});
function receiver(payload) {
  let response = eval(payload.script);
  send({ id: payload.id, type: "response", body: response });

  recv("control", (message) => {
    receiver(message.payload);
  });
}
