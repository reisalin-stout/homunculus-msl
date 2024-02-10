const { readFileSync, writeFileSync } = require("fs");

const db = readFileSync("./app/data/astromon-db.json");
const dict = JSON.parse(db);
const out = [];
Object.keys(dict).forEach((astroname) => {
  Object.keys(dict[astroname]).forEach((element) => {
    Object.keys(dict[astroname][element]).forEach((tier) => {
      out.push(dict[astroname][element][tier].uid);
    });
  });
});
writeFileSync("./saved/out/alluid.json", JSON.stringify(out, null, 2));
