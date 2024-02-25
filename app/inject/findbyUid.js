class Astromon {
  /*public const MonsterStatType MsNone = 0;
	public const MonsterStatType MsAttack = 1;
	public const MonsterStatType MsDefence = 2;
	public const MonsterStatType MsHeal = 3;
	public const MonsterStatType MsBalance = 4;
	public const MonsterStatType MsHp = 5;
  */
  constructor(start) {
    this.start = start;
    this.offsets = {
      starting_add: start,
      id: { offset: 0, type: "dword", value: this.point(0, TYPE.DWORD) },
      user_id: { offset: 2, type: "dword", value: this.point(2, TYPE.DWORD) },
      monster_uid: {
        offset: 4,
        type: "dword",
        value: this.point(4, TYPE.DWORD),
      },
      level: { offset: 5, type: "dword", value: this.point(5, TYPE.DWORD) },
      attack: { offset: 6, type: "float", value: this.point(6, TYPE.FLOAT) },
      defense: { offset: 7, type: "float", value: this.point(7, TYPE.FLOAT) },
      recovery: { offset: 8, type: "float", value: this.point(8, TYPE.FLOAT) },
      hp: { offset: 10, type: "double", value: this.point(10, TYPE.DOUBLE) },
      stat_type: {
        offset: 12,
        type: "dword",
        value: this.point(12, TYPE.DWORD),
      },
      variant: { offset: 13, type: "dword", value: this.point(13, TYPE.DWORD) },
      exp: { offset: 14, type: "dword", value: this.point(14, TYPE.DWORD) },
      gem_1_shape: {
        offset: 15,
        type: "dword",
        value: this.point(15, TYPE.DWORD),
      },
      gem_2_shape: {
        offset: 16,
        type: "dword",
        value: this.point(16, TYPE.DWORD),
      },
      gem_3_shape: {
        offset: 17,
        type: "dword",
        value: this.point(17, TYPE.DWORD),
      },
      gem_1_id: {
        offset: 18,
        type: "dword",
        value: this.point(18, TYPE.DWORD),
      },
      gem_2_id: {
        offset: 20,
        type: "dword",
        value: this.point(20, TYPE.DWORD),
      },
      gem_3_id: {
        offset: 22,
        type: "dword",
        value: this.point(22, TYPE.DWORD),
      },
      grade: { offset: 24, type: "dword", value: this.point(24, TYPE.DWORD) },
      lock: { offset: 25, type: "bool", value: this.point(25, TYPE.BOOL) },
      created_timestamp: {
        offset: 26,
        type: "dword",
        value: this.point(26, TYPE.DWORD),
      },
      variant_level: {
        offset: 32,
        type: "dword",
        value: this.point(32, TYPE.DWORD),
      },
      updated_timestamp: {
        offset: 37,
        type: "dword",
        value: this.point(37, TYPE.DWORD),
      },
      storage_location: {
        offset: 38,
        type: "dword",
        value: this.point(38, TYPE.DWORD),
      },
      passive_books: {
        offset: 39,
        type: "dword",
        value: this.point(39, TYPE.DWORD),
      },
      active_books: {
        offset: 40,
        type: "dword",
        value: this.point(40, TYPE.DWORD),
      },
      costume_uid: {
        offset: 41,
        type: "dword",
        value: this.point(41, TYPE.DWORD),
      },
      trinket_1_id: {
        offset: 42,
        type: "dword",
        value: this.point(42, TYPE.DWORD),
      },
      trinket_2_id: {
        offset: 44,
        type: "dword",
        value: this.point(44, TYPE.DWORD),
      },
      trinket_3_id: {
        offset: 46,
        type: "dword",
        value: this.point(46, TYPE.DWORD),
      },
      enhancements: {
        offset: 48,
        type: "addr",
        value: this.point(48, TYPE.ADDR),
      },
      total_atk_sort: {
        offset: 52,
        type: "float",
        value: this.point(52, TYPE.FLOAT),
      },
      super_ascension_skill: {
        offset: 53,
        type: "addr",
        value: this.point(53, TYPE.ADDR),
      },
      fixed_defense: {
        offset: 55,
        type: "float",
        value: this.point(55, TYPE.FLOAT),
      },
      favorite: { offset: 57, type: "bool", value: this.point(57, TYPE.BOOL) },
    };
  }
  get isValid() {
    const conditions = {
      level: { min: 0, max: 60 },
      attack: { min: 0, max: 6000 },
      defense: { min: 0, max: 6000 },
      recovery: { min: 0, max: 6000 },
      hp: { min: 0, max: 60000 },
      variant: { min: 1, max: 2 },
      gem_1_shape: { min: 1, max: 3 },
      gem_2_shape: { min: 1, max: 3 },
      gem_3_shape: { min: 1, max: 3 },
      grade: { min: 1, max: 9 },
      total_atk_sort: { min: 1, max: 1000000001 },
    };
    for (const property in conditions) {
      if (this.offsets.hasOwnProperty(property)) {
        const value = this.offsets[property].value;
        const condition = conditions[property];
        if (typeof value === "number" && value >= condition.min && value <= condition.max) {
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

  catch_gem(uid) {
    return uid;
  }
}

function findAllMonstersByUserId() {
  let tries = 5;
  const ranges = Process.enumerateRanges({ protection: "rw-", coalesce: true });
  const user_id = toHex32(injected_options.user_id, TYPE.DWORD);
  let unique_results = [];
  try {
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];

      const result = Memory.scanSync(range.base, range.size, user_id);
      if (result.length > 0) {
        for (let r = 0; r < result.length; r++) {
          let uid_address = result[r].address.add(8).readU32();
          if (injected_options.uid_s.includes(uid_address)) {
            unique_results.push(result[r].address.sub(8));
          }
        }
      }
    }
  } catch (error) {
    if (error.message.includes("access violation")) {
    } else {
      send(error.message);
    }
  }

  let astromon_inventory = [];
  for (let a = 0; a < unique_results.length; a++) {
    const starting_address = unique_results[a];
    let astromon = new Astromon(starting_address);
    if (astromon.isValid) {
      astromon_inventory.push(astromon.offsets);
    }
  }

  if (astromon_inventory.length > 0) {
    return {
      type: "astromon-inventory",
      body: astromon_inventory,
    };
  } else {
    send("No results found, trying again");
  }
}

findAllMonstersByUserId();
