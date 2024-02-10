const fsp = require("fs/promises");
const https = require("https");

class AstromonEntry {
  constructor(object) {
    this.uid = object.uid;
    this.name = object.name;
    this.class = object.stat_type;
    /*
    this.hp = object.hp;
    this.atk = object.attack;
    this.def = object.defence;
    this.rec = object.recovery;
    this.cr = object.crit_rate;
    this.cd = object.crit_dmg;
    this.res = object.resist;
    */
    this.passive = getbooks(object.default_effect);
    this.active = getbooks(object.default_effect);
    this.icon = object.icon_name;
  }
}
function getbooks(entry) {
  return entry.book_weight;
}

async function getURL(apiUrl) {
  return new Promise((resolve, reject) => {
    https
      .get(apiUrl, (response) => {
        let data = "";
        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          try {
            const jsonData = JSON.parse(data);
            resolve(jsonData);
          } catch (error) {
            reject(new Error(`Error parsing JSON: ${error.message}`));
          }
        });
      })
      .on("error", (error) => {
        reject(new Error(`Error: ${error.message}`));
      });
  });
}

async function writeToFile(data, path) {
  try {
    await fsp.writeFile(path, JSON.stringify(data));
    console.log(`Data successfully written to ${path}`);
  } catch (error) {
    console.error(`Error writing to file ${path}: ${error.message}`);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseSiteData(astromonJSON) {
  let astromonDB = {};

  Object.keys(astromonJSON).forEach((family) => {
    astromonJSON[family].forEach((entry) => {
      let data = new AstromonEntry(entry.node);
      if (!astromonDB[family]) {
        astromonDB[family] = {};
      }
      if (!astromonDB[family][entry.node.element]) {
        astromonDB[family][entry.node.element] = {};
      }
      if (!astromonDB[family][entry.node.element][entry.node.evolution]) {
        astromonDB[family][entry.node.element][entry.node.evolution] = {};
      }
      astromonDB[family][entry.node.element][entry.node.evolution] = data;
    });
  });

  return astromonDB;
}

async function dumpSite() {
  const pageDataUrl = "https://astroguide.xyz/page-data/sq/d/1179435288.json";
  let astromonFamilies = [];
  const pageData = await getURL(pageDataUrl);
  pageData.data.allAstromonsJson.edges.forEach(async (element) => {
    if (astromonFamilies.indexOf(element.node.family_slug) == -1) {
      astromonFamilies.push(element.node.family_slug);
    }
  });

  let allAstromonData = {};
  for (const family of astromonFamilies) {
    console.log(`Dumping ${family}`);
    const classy = await getURL(
      `https://astroguide.xyz/page-data/astromons/${family}/page-data.json`
    );
    allAstromonData[family] = classy.result.data.allAstromonsJson.edges;
    await sleep(1000);
  }
  console.log("Parsing site data");
  const astromonDB = parseSiteData(allAstromonData);

  writeToFile(astromonDB, "./dump/astromon-db.json");
}

dumpSite();

//============================== Old code ==============================

class Astromon {
  constructor(blob) {
    this.slug = blob.family_slug;
    this.family = blob.family_name;
    this.name = blob.name;
    this.element = blob.element == "tree" ? "wood" : blob.element;
    this.evolution = blob.evolution;
    this.icon = blob.icon_name;
    this.story = blob.story_desc;
    this.type = blob.stat_type;
    this.ai = blob.active_ai;
    this.stats = new Stats(blob);
    this.skills = new Skills(blob);
  }
}

class Stats {
  constructor(blob) {
    this.hp = blob.hp;
    this.atk = blob.attack;
    this.def = blob.defence;
    this.rec = blob.recovery;
    this.cd = blob.crit_dmg - 100;
    this.cr = blob.crit_rate;
    this.res = blob.resist;
    this.cre = 0;
  }
}

class Skills {
  constructor(blob) {
    this.leadSkill = {
      name: blob.leader_effect.name,
      text: blob.leader_effect.description,
      value: getModifier(blob.leader_effect.description),
      icon: blob.leader_effect.icon_name,
    };
    this.defaultSkill = {
      name: blob.default_skill.name,
      text: blob.default_skill.description,
      icon: blob.default_skill.icon_name,
      effect_name: blob.default_effect.name,
      effect_text: blob.default_effect.description,
      effect_value: getModifier(blob.default_effect.description),
      effect_icon: blob.default_effect.icon_name,
      book_max: blob.default_effect.book_weight,
      target: blob.default_skill.target,
    };
    this.activeSkill = {
      name: blob.active_skill.name,
      text: blob.active_skill.description,
      icon: blob.active_skill.icon_name,
      effect_name: blob.active_effect.name,
      effect_text: blob.active_effect.description,
      effect_value: getModifier(blob.active_effect.description),
      effect_icon: blob.active_effect.icon_name,
      book_max: blob.active_effect.book_weight,
      target: blob.active_skill.target,
    };
    this.superSkill = blob.super_skill
      ? {
          name: blob.super_skill?.name,
          text: blob.super_skill?.description,
          icon: blob.super_skill?.icon_name,
          effect_name: blob.super_effect?.name,
          effect_text: blob.super_effect?.description,
          effect_value: getModifier(blob.super_effect?.description),
          effect_icon: blob.super_effect?.icon_name,
          book_max: blob.active_effect?.book_weight,
          target: blob.super_skill?.target,
        }
      : null;
    this.ultimateSkill = blob.ultimate_effect
      ? {
          effect_name: blob.ultimate_effect?.name,
          effect_text: blob.ultimate_effect?.description,
          effect_value: getModifier(blob.ultimate_effect?.description),
          effect_icon: blob.ultimate_effect?.icon_name,
        }
      : null;
  }
}

async function listIcon() {
  var list = [];

  for (const slug of Object.keys(update.data)) {
    for (const element of Object.keys(update.data[slug])) {
      for (const evolution of Object.keys(update.data[slug][element])) {
        const object = update.data[slug][element][evolution];
        const icons = [
          object.icon,
          object.skills.leadSkill.icon,
          object.skills.defaultSkill.icon,
          object.skills.defaultSkill.effect_icon,
          object.skills.activeSkill.icon,
          object.skills.activeSkill.effect_icon,
          object.skills.superSkill?.icon,
          object.skills.superSkill?.effect_icon,
          object.skills.ultimateSkill?.effect_icon,
        ];

        for (const address of icons) {
          if (address != undefined) {
            if (!list.includes(address)) {
              list.push(address);
            }
          }
        }
      }
    }
  }

  for (const png of list) {
    if (exists(preAddress + png)) {
      moveFile(preAddress + png, postAddress + png);
    } else {
      console.log("file not found: " + png);
    }
  }
}

function moveFile(origin, target) {
  mv(origin, target, function (err) {
    if (err) throw err;
  });
}

function remakeAstromon() {
  var db = {};

  for (const slug of slugs.data) {
    const entry = database.data[slug];
    db[slug] = {
      fire: {},
      water: {},
      wood: {},
      light: {},
      dark: {},
    };

    for (var astromon of entry) {
      var output = new Astromon(astromon.node);
      var key = "";

      if (output.evolution >= 4) {
        key = isSuperEvo(output);
      } else {
        key = "evo" + output.evolution;
      }

      db[slug][output.element][key] = output;
    }
  }

  makeJson("astromon-db", db);
}

function isSuperEvo(blob) {
  var prefix = "";
  if (blob.skills.ultimateSkill != null) {
    prefix = "UE";
    console.log("it's probably a Ultimate Evo");
  } else {
    var cut = blob.name.replace(/\s/g, "");
    cut = cut.slice(cut.indexOf(">") + 1);
    console.log(cut);

    if (
      cut.localeCompare(blob.family, "en", {
        sensitivity: "base",
        ignorePunctuation: true,
      }) == 0
    ) {
      prefix = "SE-A";
      console.log("It's a small Super Evo");
    } else {
      prefix = "SE-B";
      console.log("It's a big Super Evo");
    }
  }
  console.log(blob.name);
  return prefix;
}

function getModifier(text) {
  if (text == undefined) {
    return 0;
  }

  const position = text.indexOf("%");
  var value = "";
  var supplement = "";
  var useSupp = false;

  for (var i = 1; ; i++) {
    var current = text[position - i];
    if (position - i == -1) {
      break;
    } else if (current == ")") {
      useSupp = true;
    } else if (current == "+" || current == "(") {
      useSupp = false;
    } else if (isNaN(current) || current == " ") {
      break;
    } else {
      if (useSupp) {
        supplement = current + supplement;
      } else {
        value = current + value;
      }
    }
  }

  return [
    parseInt(value),
    !isNaN(supplement) && supplement != "" ? parseInt(supplement) : 0,
  ];
}

async function updateData() {
  console.log("----- Starting -----\n");
  var data = [];
  await database.data.allAstromonsJson.edges.forEach((element) => {
    var newSlug = element.node.family_slug;
    if (!data.includes(newSlug)) {
      data.push(newSlug);
    }
  });
  console.log("Slugs loaded.\n");

  const queryStart = "https://astroguide.xyz/page-data/astromons/";
  const queryEnd = "/page-data.json";
  var chunks = {};

  for (const slug of data) {
    console.log("downloading " + slug);
    var chunk = await fetch(queryStart + slug + queryEnd).then((response) =>
      response.json()
    );
    chunks[slug] = chunk.result.data.allAstromonsJson.edges;
    await delay(1000);
  }

  console.log("Chunks loaded.\n");

  makeJson("astromon-data", chunks);
}
