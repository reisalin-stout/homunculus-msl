const fs = require("fs");
const { c } = require("tar");

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

function packFiles() {
  pack("renderer", "renderer.tgz");
  return;
}
const path = require("path");
const crypto = require("crypto");

async function calculateChecksum(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (data) => {
      hash.update(data);
    });

    stream.on("end", () => {
      const checksum = hash.digest("hex");
      resolve(checksum);
    });

    stream.on("error", (error) => {
      reject(error);
    });
  });
}

async function generateChecksums(folders) {
  const checksums = {};

  async function traverseFolder(folderPath, currentObject) {
    try {
      const entries = await fs.promises.readdir(folderPath, { withFileTypes: true });

      for (const entry of entries) {
        const entryPath = path.join(folderPath, entry.name);

        if (entry.isDirectory()) {
          const folderObject = {};
          currentObject[entry.name] = folderObject;
          await traverseFolder(entryPath, folderObject);
        } else if (entry.isFile()) {
          const checksum = await calculateChecksum(entryPath);
          currentObject[entry.name] = checksum;
        }
      }
    } catch (error) {
      console.error("Error traversing folder:", error);
    }
  }

  for (const folder of folders) {
    const folderName = path.basename(folder);
    checksums[folderName] = {};
    await traverseFolder(folder, checksums[folderName]);
  }

  return checksums;
}

function copyFoldersRecursive(sourceFolders, targetFolder) {
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  for (const sourceFolder of sourceFolders) {
    const targetFolderPath = targetFolder + "/" + sourceFolder.split("/").slice(-1)[0];

    if (!fs.existsSync(targetFolderPath)) {
      fs.mkdirSync(targetFolderPath, { recursive: true });
    }

    const files = fs.readdirSync(sourceFolder);

    for (const file of files) {
      const sourceFilePath = sourceFolder + "/" + file;
      const targetFilePath = targetFolderPath + "/" + file;

      if (fs.lstatSync(sourceFilePath).isDirectory()) {
        copyFoldersRecursive([sourceFilePath], targetFolderPath);
      } else {
        fs.copyFileSync(sourceFilePath, targetFilePath);
      }
    }
  }
}

const sourceFolders = ["renderer", "app", "saved"];
const targetFolder = "build/Homunculus";

copyFoldersRecursive(sourceFolders, targetFolder);
