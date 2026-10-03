/**
 * Browser-safe cryptographic primitives for CAIN security operations.
 * Works uniformly in browser (client-side) and SSR/Node.
 */

// Pure JS SHA-256 implementation (browser and SSR safe, 0 external deps)
function sha256Pure(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let lengthProperty = "length";
  let i = 0;
  let j = 0;

  const result: number[] = [];
  const words: number[] = [];
  let asciiBitLength = ascii[lengthProperty] * 8;

  // Initial hash value: first 32 bits of the fractional parts of the square roots of the first 8 primes
  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  // First 64 prime constants
  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let compositeBitLength = asciiBitLength;
  const utf8: number[] = [];
  for (let idx = 0; idx < ascii.length; idx++) {
    let charcode = ascii.charCodeAt(idx);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      idx++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (ascii.charCodeAt(idx) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }

  compositeBitLength = utf8.length * 8;
  utf8.push(0x80);
  while ((utf8.length % 64) !== 56) utf8.push(0);

  for (i = 0; i < utf8.length; i += 4) {
    words.push((utf8[i] << 24) | (utf8[i + 1] << 16) | (utf8[i + 2] << 8) | utf8[i + 3]);
  }

  words.push(Math.floor(compositeBitLength / maxWord));
  words.push(compositeBitLength >>> 0);

  // Process 512-bit chunks
  const w = new Array(64);
  for (i = 0; i < words.length; i += 16) {
    const a = hash[0];
    const b = hash[1];
    const c = hash[2];
    const d = hash[3];
    const e = hash[4];
    const f = hash[5];
    const g = hash[6];
    const h = hash[7];

    let tA = a, tB = b, tC = c, tD = d, tE = e, tF = f, tG = g, tH = h;

    for (j = 0; j < 64; j++) {
      if (j < 16) {
        w[j] = words[i + j];
      } else {
        const gamma0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
        const gamma1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
        w[j] = (w[j - 16] + gamma0 + w[j - 7] + gamma1) | 0;
      }

      const s1 = rightRotate(tE, 6) ^ rightRotate(tE, 11) ^ rightRotate(tE, 25);
      const ch = (tE & tF) ^ (~tE & tG);
      const temp1 = (tH + s1 + ch + k[j] + w[j]) | 0;
      const s0 = rightRotate(tA, 2) ^ rightRotate(tA, 13) ^ rightRotate(tA, 22);
      const maj = (tA & tB) ^ (tA & tC) ^ (tB & tC);
      const temp2 = (s0 + maj) | 0;

      tH = tG;
      tG = tF;
      tF = tE;
      tE = (tD + temp1) | 0;
      tD = tC;
      tC = tB;
      tB = tA;
      tA = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + tA) | 0;
    hash[1] = (hash[1] + tB) | 0;
    hash[2] = (hash[2] + tC) | 0;
    hash[3] = (hash[3] + tD) | 0;
    hash[4] = (hash[4] + tE) | 0;
    hash[5] = (hash[5] + tF) | 0;
    hash[6] = (hash[6] + tG) | 0;
    hash[7] = (hash[7] + tH) | 0;
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j >= 0; j--) {
      result.push((hash[i] >> (8 * j)) & 255);
    }
  }

  return result.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function computeSha256(text: string): string {
  return sha256Pure(text);
}

export function computeHmacSha256(key: string, message: string): string {
  // HMAC-SHA256 standard algorithm
  const blockSize = 64;
  let keyBytes: number[] = [];

  for (let i = 0; i < key.length; i++) {
    keyBytes.push(key.charCodeAt(i) & 0xff);
  }

  if (keyBytes.length > blockSize) {
    const keyHash = sha256Pure(key);
    keyBytes = [];
    for (let i = 0; i < keyHash.length; i += 2) {
      keyBytes.push(parseInt(keyHash.substr(i, 2), 16));
    }
  }

  while (keyBytes.length < blockSize) {
    keyBytes.push(0);
  }

  const oKeyPad = new Array(blockSize);
  const iKeyPad = new Array(blockSize);

  for (let i = 0; i < blockSize; i++) {
    oKeyPad[i] = String.fromCharCode(keyBytes[i] ^ 0x5c);
    iKeyPad[i] = String.fromCharCode(keyBytes[i] ^ 0x36);
  }

  const inner = sha256Pure(iKeyPad.join("") + message);
  let innerHexStr = "";
  for (let i = 0; i < inner.length; i += 2) {
    innerHexStr += String.fromCharCode(parseInt(inner.substr(i, 2), 16));
  }

  return sha256Pure(oKeyPad.join("") + innerHexStr);
}

export function generateRandomHex(byteCount: number): string {
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const bytes = new Uint8Array(byteCount);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  // Fallback random
  let s = "";
  for (let i = 0; i < byteCount; i++) {
    s += Math.floor(Math.random() * 256).toString(16).padStart(2, "0");
  }
  return s;
}

export function generateRandomBytes(byteCount: number): Uint8Array {
  const bytes = new Uint8Array(byteCount);
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < byteCount; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  return bytes;
}
