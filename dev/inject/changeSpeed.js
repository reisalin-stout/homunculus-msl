function findSpeed() {
  const ranges = Process.enumerateRanges({ protection: "r--", coalesce: true });
  const field2 = 1051372203;
  const field3 = 1022739087;
  let field_to_hex = toHex32(field2, 0);
  try {
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      const result = Memory.scanSync(range.base, range.size, field_to_hex);
      if (result.length > 0) {
        for (let r = 0; r < result.length; r++) {
          let next_field = result[r].address.add(4).readU32();
          if (next_field == field3) {
            let prev_field = result[r].address.sub(4).readFloat();
            if (prev_field >= 1 && prev_field <= 3) {
              return result[r].address.sub(4);
            }
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
}

function changeSpeed(game_speed, { address = null, id = null } = {}) {
  let speed_target = null;

  if (id) {
    clearInterval(id);
  }
  if (address) {
    speed_target = ptr(address);
  } else {
    speed_target = findSpeed();
  }

  if (speed_target) {
    var intervalId = setInterval(function () {
      speed_target.writeFloat(game_speed);
      if (game_speed == 0) {
        speed_target.writeFloat(1);
        clearInterval(intervalId);
        intervalId = null;
      }
    }, 15);
  }

  return {
    type: "speed-change",
    body: {
      timer: intervalId,
      address: speed_target,
    },
  };
}

changeSpeed(injected_options.game_speed, injected_options.additional_options);
