function changeAllValues() {
  send(injected_options.modifications);
  const modifications = injected_options.modifications;
  for (let m = 0; m < modifications.length; m++) {
    let mod = modifications[m];
    let target = ptr(mod.address_base);
    target = target.add(mod.offset * 4);
    switch (mod.type) {
      case "dword":
        target.writeU32(mod.new_value);
        break;
      case "float":
        target.writeFloat(mod.new_value);
        break;
      case "bool":
        target.writeU32(mod.new_value != 0 ? 1 : 0);
        break;
    }
  }
  return {
    type: "value-changes",
    body: "Values successfully changed",
  };
}

changeAllValues();
