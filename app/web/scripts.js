let database = {};

document.addEventListener("DOMContentLoaded", async function () {
  database = await fetch("astromon-db.json")
    .then((response) => {
      if (!response.ok) {
        clog(response);
      }
      return response.json();
    })
    .then((data) => {
      clog("Database ready");
      return data;
    })
    .catch((error) => {
      clog(error);
    });

  appListener.receiver = (object) => {
    switch (object.type) {
      case "response":
        clog(object.body);
        break;
    }
  };
  appListener.scriptResult = (data) => {
    switch (data.type) {
      case "astromon-inventory":
        data.body.forEach((element) => {
          let astromonEntry = findAstromonData(element);
          makeAstromonIcon(astromonEntry, element);
        });
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

function findAstromonData(astromonData) {
  let object = null;

  Object.keys(database).forEach((slug) => {
    Object.keys(database[slug]).forEach((element) => {
      Object.keys(database[slug][element]).forEach((evo) => {
        if (database[slug][element][evo].uid == astromonData.monster_uid) {
          object = database[slug][element][evo];
          object.element = element;
          object.tier = evo;
          return;
        }
      });
    });
  });
  return object;
}

function makeAstromonIcon(constants, instance) {
  const astroString = `
  <div class="astromon-portrait-container">
  <img src="assets/icons/${constants.icon}" alt="Icon" class="astromon-icon">
  <img src="assets/items/portrait-element-${constants.element}.png" alt="Element">
  <img src="assets/items/portrait-evo-${constants.tier}.png" alt="Border">
</div>
  `;
  document.getElementById("content").innerHTML += astroString;
}
