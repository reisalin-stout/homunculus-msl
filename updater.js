const fs = require("fs");
const https = require("https");
const { c, x, list } = require("tar");

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

fs.readFile("update-list.json", (err, data) => {
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
/*
// Example usage
const downloadUrl = 'https://example.com/example.tar.gz';
const downloadDestination = 'downloads';
const tarGzFile = 'example.tar.gz';
const unpackDestination = 'unpacked';
const sourceFolder = 'folder_to_bundle';

// Download the tar.gz file
download(downloadUrl, downloadDestination, tarGzFile)
    .then(() => {
        console.log('Downloaded tar.gz file successfully');
        // Unpack the tar.gz file
        return unpack(`${downloadDestination}/${tarGzFile}`, unpackDestination);
    })
    .then(() => {
        console.log('Unpacked tar.gz file successfully');
        // Bundle a folder into a tar.gz file
        return pack(sourceFolder, `${downloadDestination}/bundled.tar.gz`);
    })
    .then(() => {
        console.log('Bundled folder into tar.gz file successfully');
    })
    .catch(error => {
        console.error('Error:', error);
    });

    */
