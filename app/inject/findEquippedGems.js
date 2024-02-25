class Gem {
  constructor(start) {
    this.start = start;
    this.offsets = {
      starting_add: start,
      id: { offset: 0, type: "dword", value: this.point(0, TYPE.DWORD) },
      form: { offset: 2, type: "dword", value: this.point(2, TYPE.DWORD) },
      equipped: { offset: 3, type: "dword", value: this.point(3, TYPE.DWORD) },
      rank: { offset: 4, type: "dword", value: this.point(4, TYPE.DWORD) },
      tier: { offset: 5, type: "dword", value: this.point(5, TYPE.DWORD) },
      substats_pointer: { offset: 6, type: "addr", value: this.point(6, TYPE.ADDR) },
      starting_subs: { offset: 8, type: "dword", value: this.point(8, TYPE.DWORD) },
      failures: { offset: 9, type: "dword", value: this.point(9, TYPE.DWORD) },
      locked: { offset: 10, type: "dword", value: this.point(10, TYPE.DWORD) },
      updated_timestamp: { offset: 11, type: "dword", value: this.point(11, TYPE.DWORD) },
    };
  }

  setSubs() {
    this.offsets.form.value = { id: this.point(2, TYPE.DWORD), values: findFormRegion(this.point(2, TYPE.DWORD)) };
  }

  get isValid() {
    const conditions = {
      rank: { min: 1, max: 6 },
      tier: { min: 1, max: 16 },
      starting_subs: { min: 0, max: 8 },
      locked: { min: 0, max: 1 },
      updated_timestamp: { min: 1 },
    };
    for (const property in conditions) {
      if (this.offsets.hasOwnProperty(property)) {
        const value = this.offsets[property].value;
        const condition = conditions[property];
        const minValue = condition.min;
        const maxValue = condition.max;

        if (
          typeof value === "number" &&
          (minValue === undefined || value >= minValue) &&
          (maxValue === undefined || value <= maxValue)
        ) {
          continue;
        } else {
          return false;
        }
      }
    }

    return true;
  }

  point(offset, type) {
    let target = this.start.add(offset * 4);
    let result;
    switch (type) {
      case TYPE.DWORD:
        result = target.readU32();
        break;
      case TYPE.FLOAT:
        result = target.readFloat();
        break;
      case TYPE.ADDR:
        result = `${target.readPointer().toString()}`;
        break;
      case TYPE.DOUBLE:
        result = target.readDouble();
        break;
      case TYPE.QWORD:
        result = target.readU64();
        break;
      case TYPE.BOOL:
        result = target.readU32() == 1 ? true : false;
    }
    return result;
  }
}

class Form {
  constructor(start) {
    this.start = start;
    this.offsets = {
      starting_add: start,
      id: { offset: 0, type: "dword", value: this.point(0, TYPE.DWORD) },
      shape: { offset: 1, type: "dword", value: this.point(2, TYPE.DWORD) },
      set: { offset: 3, type: "dword", value: this.point(3, TYPE.DWORD) },
    };
  }
  point(offset, type) {
    let target = this.start.add(offset * 4);
    let result;
    switch (type) {
      case TYPE.DWORD:
        result = target.readU32();
        break;
      case TYPE.FLOAT:
        result = target.readFloat();
        break;
      case TYPE.ADDR:
        result = `${target.readPointer().toString()}`;
        break;
      case TYPE.DOUBLE:
        result = target.readDouble();
        break;
      case TYPE.QWORD:
        result = target.readU64();
        break;
      case TYPE.BOOL:
        result = target.readU32() == 1 ? true : false;
    }
    return result;
  }
}

const TYPE = {
  DWORD: 0,
  FLOAT: 1,
  ADDR: 2,
  DOUBLE: 3,
  QWORD: 4,
  BOOL: 5,
};

function findGemByUid() {
  let uiddefault = 1605378868;
  const gemId = toHex32(uiddefault, TYPE.DWORD);

  const ranges = Process.enumerateRanges({ protection: "rw-", coalesce: true });
  let search = toHex32(257, TYPE.DWORD);
  let unique_results = [];
  try {
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      const result = Memory.scanSync(range.base, range.size, search);
      if (result.length > 0) {
        for (let r = 0; r < result.length; r++) {
          unique_results.push(new Gem(result[r].address.sub(12)));
        }
      }
    }
  } catch (error) {
    if (error.message.includes("access violation")) {
    } else {
      send(error.message);
    }
  }

  let gem_inventory = [];

  for (let a = 0; a < unique_results.length; a++) {
    const gemItem = unique_results[a];
    if (gemItem.isValid) {
      gem_inventory.push(gemItem.offsets);
    }
  }

  if (gem_inventory.length > 0) {
    let forms = [];
    for (let g = 0; g < gem_inventory.length; g++) {
      const formId = gem_inventory[g].form.value;
      forms.push(formId);
    }
    let form_addresses = scanMemory(forms);

    return {
      type: "gem-search",
      body: { inventory: gem_inventory, forms: form_addresses },
    };
  } else {
    send("No results found, trying again");
    return {
      type: "res",
      body: "No result",
    };
  }
}

findGemByUid();
