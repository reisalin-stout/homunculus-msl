const fs = require("fs");
const fsp = require("fs/promises");
const https = require("https");
const { c, x } = require("tar");

function download(url, filename, destination, depth) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(`./saved/tmp/${filename}`);
    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close(resolve);
          unpack(destination, `./saved/tmp/${filename}`, depth);
        });
      })
      .on("error", (error) => {
        fs.unlink(`./saved/tmp/${filename}`, () => {
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

function pack(folder, file) {
  const files = listFiles(folder);
  c(
    {
      gzip: { level: 9 },
      file: file,
    },
    files
  );
}

function listFiles(folder) {
  let files = [];

  fs.readdirSync(folder).forEach((file) => {
    const absolutePath = folder + "/" + file;
    if (fs.statSync(absolutePath).isDirectory()) {
      const filesFromNestedFolder = listFiles(absolutePath);
      filesFromNestedFolder.forEach((file) => {
        files.push(file);
      });
    } else {
      files.push(absolutePath);
    }
  });

  return files;
}

async function createFolders(paths) {
  for (const path of paths) {
    try {
      await fsp.mkdir(path, { recursive: true });
      console.log(`Folder created: ${path}`);
    } catch (error) {
      console.log(`Error creating folder: ${path}`, error);
    }
  }
}

const folders = [
  "app/bin",
  "app/data/assets",
  "saved",
  "saved/logs",
  "saved/out",
  "saved/screenshots",
  "saved/tmp",
];

fs.readFile("update-list.json", async (err, data) => {
  await createFolders(folders);
  const list = JSON.parse(data);
  Object.keys(list).forEach((nameFile) => {
    download(
      list[nameFile].url,
      list[nameFile].name,
      list[nameFile].path,
      list[nameFile].depth
    );
  });
});
