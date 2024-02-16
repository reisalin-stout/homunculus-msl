document.addEventListener("DOMContentLoaded", function () {
  appListener.receiver = (object) => {
    switch (object.type) {
      case "response":
        clog(object.body);
        break;
      case "astromon-inventory":
        clog(typeof object.body);

        break;
    }
  };
  appListener.tick = (data) => {
    clog(data);
  };
  appListener.error = (error) => {
    clog(error);
  };
});
