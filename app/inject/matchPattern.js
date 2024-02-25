function matchPattern() {
  const ranges = Process.enumerateRanges({ protection: "r--" });
  let forms = [
    1717977055, 1537032077, 1120613377, 416610574, 510317913, 1611784019, 177242801, 287005468, 924914994, 357900908,
    1422133646, 2131935241, 1243994822,
  ];

  // Define the pattern and mask for Memory.scanSync()
  let pattern = "03 00 00 00 : fc ff ff ff";
  let results = [];
  let range;
  try {
    for (let i = 0; i < ranges.length; i++) {
      range = ranges[i];
      if (typeof range.file === "undefined") {
        const scanResult = Memory.scanSync(range.base.add(4), range.size - 4, pattern);
        for (let r = 0; r < scanResult.length; r++) {
          //let last = scanResult[r].address.sub(4).readU32();
          let val = scanResult[r].address.readU32();
          if (val != 0) {
            //let next = scanResult[r].address.add(4).readU32();
            //if (next > 0 && next <= 40 && forms.indexOf(last) !== -1) {
            //  let output = [last, val, next];
            results.push(val);
            //}
          }
        }
      } else {
        send(range.file);
      }
    }
  } catch (error) {
    send("Error occurred during memory scanning:");
    send(`In range ${range.base} -> ${range.base.add(range.size)} (${range.size}) (${range.protection})`);
    send(error.message);
  }

  return { type: "pattern", body: JSON.stringify({ data: results }) };
}

matchPattern();
