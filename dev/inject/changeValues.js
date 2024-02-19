function changeAllValues() {
  send(injected_options.modifications);
  const modifications = injected_options.modifications;
  for (let m = 0; m < modifications.length; m++) {
    let mod = modifications[m];
    let target = ptr(mod.address_base);
    target = target.add(mod.offset * 4);
    let target_value;
    switch (mod.type) {
      case "dword":
        send(target);
        target_value = parseInt(mod.new_value);
        target.writeU32(target_value);
        break;
      case "float":
        target_value = parseFloat(mod.new_value);
        target.writeFloat(target_value);
        break;
      case "bool":
        target.writeU32(target_value != 0 ? 1 : 0);
        break;
    }
  }
  return {
    type: "value-changes",
    body: "Values successfully changed",
  };
}

changeAllValues();
