import BN from "bn.js";
import { PublicKey } from "@solana/web3.js";

export function parseType<T>(v: T): string {
  if (v === null || v === undefined) {
    return "null";
  }
  if (typeof v === "object") {
    if (v instanceof Array) {
      return "array";
    }
    if (v instanceof Date) {
      return "date";
    }
    return "dict";
  }
  return typeof v;
}

export function stringifyPubkeysAndBNInArray(a: any[]): any[] {
  const newA = [];
  for (const i of a) {
    if (i instanceof PublicKey) {
      newA.push(i.toBase58());
    } else if (i instanceof BN) {
      newA.push(i.toString());
    } else if (parseType(i) === "array") {
      newA.push(stringifyPubkeysAndBNInArray(i));
    } else if (parseType(i) === "dict") {
      newA.push(stringifyPubkeysAndBNsInObject(i));
    } else {
      newA.push(i);
    }
  }
  return newA;
}

export function stringifyPubkeysAndBNsInObject(o: any): any {
  const newO = { ...o };
  for (const [k, v] of Object.entries(newO)) {
    if (v instanceof PublicKey) {
      newO[k] = v.toBase58();
    } else if (v instanceof BN) {
      newO[k] = v.toString();
    } else if (parseType(v) === "array") {
      newO[k] = stringifyPubkeysAndBNInArray(v as any);
    } else if (parseType(v) === "dict") {
      newO[k] = stringifyPubkeysAndBNsInObject(v);
    } else {
      newO[k] = v;
    }
  }
  return newO;
}
