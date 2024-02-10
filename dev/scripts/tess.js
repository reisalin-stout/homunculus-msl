const { createWorker, PSM } = require("tesseract.js");

const system = require("./system.js");

async function main() {}

const jimp = require("jimp");
class Vector2 {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.ratio = x / y;
  }

  sum(vector) {
    const sumX = this.x + vector.x;
    const sumY = this.y + vector.y;
    return new Vector2(sumX, sumY);
  }

  mul(value) {
    const mulX = this.x * value;
    const mulY = this.y * value;
    return new Vector2(mulX, mulY);
  }
}

const referencePoints = {
  hp: {
    start: new Vector2(660, 195).sum(new Vector2(0, 29).mul(0)),
    size: new Vector2(190, 29),
  },
  atk: {
    start: new Vector2(660, 195).sum(new Vector2(0, 29).mul(1)),
    size: new Vector2(190, 29),
  },
  def: {
    start: new Vector2(660, 195).sum(new Vector2(0, 29).mul(2)),
    size: new Vector2(190, 29),
  },
  rec: {
    start: new Vector2(660, 195).sum(new Vector2(0, 29).mul(3)),
    size: new Vector2(190, 29),
  },
  cr: {
    start: new Vector2(660, 195).sum(new Vector2(0, 29).mul(4)),
    size: new Vector2(190, 29),
  },
  cd: {
    start: new Vector2(660, 195).sum(new Vector2(0, 29).mul(5)),
    size: new Vector2(190, 29),
  },
  res: {
    start: new Vector2(660, 195).sum(new Vector2(0, 29).mul(6)),
    size: new Vector2(190, 29),
  },
  cre: {
    start: new Vector2(660, 195).sum(new Vector2(0, 29).mul(7)),
    size: new Vector2(190, 29),
  },
  lead: {
    start: new Vector2(514, 480).sum(new Vector2(85, 0).mul(0)),
    size: new Vector2(85, 23),
  },
  passive: {
    start: new Vector2(514, 480).sum(new Vector2(85, 0).mul(1)),
    size: new Vector2(85, 23),
  },
  active: {
    start: new Vector2(514, 480).sum(new Vector2(85, 0).mul(2)),
    size: new Vector2(85, 23),
  },
};

async function main() {
  await system.initialize();
  const worker = await createWorker("eng", 3, {
    workerPath: `${global.MSLEAGUE.config.paths.tesseract_folder}/src/worker-script/node/index.js`,
    corePath: `${global.MSLEAGUE.config.paths.tesseract_folder}/core/`,
    cachePath: `${global.MSLEAGUE.config.paths.tesseract_folder}/lang/`,
    gzip: false,
  });
  worker.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_LINE,
    tessedit_char_whitelist: "+0123456789 %",
    preserve_interword_spaces: 1,
  });
  const output = "lena-small-bw.jpg";

  const position = new Vector2(530, 195);
  const size = new Vector2(320, 28);

  await jimp.read("./screenshots/ss1280x720.png").then((image) => {
    image
      .invert()

      .threshold({ max: 25, replace: 255, autoGreyscale: false })

      .write(output, checkit);
  });

  async function checkit() {
    const keys = Object.keys(referencePoints);

    for (const key of keys) {
      const rect = {
        top: referencePoints[key].start.y,
        left: referencePoints[key].start.x,
        width: referencePoints[key].size.x,
        height: referencePoints[key].size.y,
      };

      try {
        const result = await worker.recognize(output, {
          rectangle: {
            top: referencePoints[key].start.y,
            left: referencePoints[key].start.x,
            width: referencePoints[key].size.x,
            height: referencePoints[key].size.y,
          },
        });
        console.log(result.data.text);
      } catch (error) {
        // Handle errors here
        console.error(error);
      }
    }
    worker.terminate();
  }
}
main();
