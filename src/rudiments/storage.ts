import Storage from "expo-sqlite/kv-store";

import { decode, encode } from "./stored";

export function load(key: string): unknown {
  try {
    return decode(Storage.getItemSync(key));
  } catch {
    return undefined;
  }
}

export function save(key: string, data: unknown) {
  try {
    Storage.setItemSync(key, encode(data));
    return true;
  } catch {
    return false;
  }
}
