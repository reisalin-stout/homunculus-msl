const { createWorker } = require("tesseract.js");
const fsp = require("fs/promises");

//const db = loadDatabase();
const imagePath = "./system/tmp/screenshots/ss1280x720.png";

async function loadDatabase() {
  const astromonJSON = await fsp.readFile("./dump/export.json");
  const parsed = JSON.parse(astromonJSON);
  console.log(parsed);
  return parsed;
}

class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.ratio = x / y;
  }
}
const targetProcesserImageSize = new Vector2(1280, 720);
class Character {
  constructor(statBuffer, leadBuffer, passiveBuffer, activeBuffer) {}

  calculateDamage(elementAdvantage, isCrit) {
    const rawDamage = this.baseAtk * this.BASE_DAMAGE_MULTIPLIER;
    const elementDamage = rawDamage * elementAdvantage;
    const critMultiplier = isCrit ? this.baseCd : 1.0;
    const finalDamage = elementDamage * critMultiplier;

    return finalDamage;
  }
}

class Realm {
  constructor(isPvp) {
    this.multiplier = isPvp ? 6 : 5.5;
  }
}

async function extractText(path, region, options) {
  const worker = await createWorker("eng");
  console.log("worker created");
  const ret = await worker.recognize(path, options);
  console.log(`${region} : --${ret.data.text}--`);
  await worker.terminate();
  return ret.data.text;
}

async function resizeImage(metadata, sharpObject) {
  var size = new Vector2(metadata.width, metadata.height);
  sharpObject
    .resize(
      targetProcesserImageSize.ratio > size.ratio
        ? { width: targetProcesserImageSize.x }
        : { width: null, height: targetProcesserImageSize.y }
    )
    .resize({
      width: targetProcesserImageSize.x,
      height: targetProcesserImageSize.y,
      fit: "cover",
      position: "centre",
    });
}

async function extractImages(imagePath) {
  try {
    const sharpObject = 0;
    console.log("object loaded");
    const metadata = await sharpObject.metadata();
    if (
      metadata.width !== targetProcesserImageSize.x ||
      metadata.height !== targetProcesserImageSize.y
    ) {
      console.log(`Image dimensions do not match, Ill try resizing it.`);
      await resizeImage(metadata, sharpObject);
    }
    console.log(`metadata = ${metadata}`);
    await extractStats(sharpObject);
    console.log("stats done");
    await extractSkills(sharpObject);
    console.log("skills done");

    console.log("completed");
    return "tesseract and sharp made it";
  } catch (error) {
    console.log(error);
  }
}

async function main() {
  const res = await extractImages(imagePath);
  return res;
}

async function extractStats(sharpImage) {
  const position = new Vector2(530, 195);
  const size = new Vector2(320, 235);
  const buffer = await sharpImage
    .clone()
    .extract({
      left: position.x,
      top: position.y,
      width: size.x,
      height: size.y,
    })
    .toBuffer();
  return buffer;
}

async function extractSkills(sharpImage) {
  const skills = {
    lead: new Vector2(535, 483),
    passive: new Vector2(620, 483),
    active: new Vector2(705, 483),
  };
  const size = new Vector2(44, 17);
  const output = {};
  console.log("about to enter loop");
  for (const region in skills) {
    const data = skills[region];
    const buffer = await sharpImage
      .clone()
      .extract({
        left: data.x,
        top: data.y,
        width: size.x,
        height: size.y,
      })
      .toBuffer();
    console.log(`Data is ${data}`);
    const image = await maskWhiteText(buffer);
    console.log("image done");
    await sharp(await image.toBuffer()).toFile(`helper-${region}.png`);
    console.log("image helper done");
    const txt = await extractText(await image.toBuffer(), region, {
      tessedit_char_whitelist: "123456",
      pattern: "Lv. %d",
    });
    console.log("extract text done");
    const [level = 0] = txt.match(/[1-6]/g) || [];
    output[region] = level;
  }
  console.log(output);
  return output;
}

async function maskWhiteText(buffer) {
  const object = sharp(buffer);
  object
    .resize(400)
    .sharpen({ sigma: 2, m1: 0, m2: 3, x1: 3, y2: 15, y3: 15 })
    .toColourspace("b-w")
    .threshold(190)
    .normalize();
  return object;
}

// ============================== Tesseract ==============================
const { createWorker } = require("tesseract.js");

const system = require("./system.js");

async function main() {
  await system.initialize();
  const worker = await createWorker("eng", 1, {
    workerPath: `${global.MSLEAGUE.config.paths.tesseract_folder}/src/worker-script/node/index.js`,
    corePath: `${global.MSLEAGUE.config.paths.tesseract_folder}/core/`,
    cachePath: `${global.MSLEAGUE.config.paths.tesseract_folder}/lang/`,
    gzip: false,
  });
  await worker
    .recognize("https://tesseract.projectnaptha.com/img/eng_bw.png")
    .then((result) => {
      console.log("result :");
      console.log(result.data.text);
    });
}

main();

module.exports = {
  Character,
};
