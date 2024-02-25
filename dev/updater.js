const fs = require("fs/promises");
const https = require("https");
const { x } = require("tar");

function download(url, filename, destination, depth) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(`./saved/downloads/${filename}`);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
          unpack(destination, `./saved/downloads/${filename}`, depth);
        });
      })
      .on("error", (error) => {
        fs.unlink(`./saved/downloads/${filename}`, () => {
          reject(error);
        });
      });
  });
}

function unpack(folder, file, depth = 0) {
  fs.createReadStream(file).pipe(
    x({
      strip: depth,
      cwd: folder,
      unlink: true,
    })
  );
}

async function updateFiles() {
  try {
    const data = await fs.readFile("update-list.json");
    const list = JSON.parse(data);
    const downloadPromises = Object.keys(list).map((nameFile) => {
      return download(list[nameFile].url, list[nameFile].name, list[nameFile].path, list[nameFile].depth);
    });
    await Promise.all(downloadPromises);
    console.log("All files downloaded and unpacked successfully.");
  } catch (error) {
    console.error("Error occurred while updating files:", error);
  }
}

module.exports = {
  updateFiles,
};
