export type DownloadableImage = {
  name: string;
  url: string;
};

function slugify(value: string) {
  const clean = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

  return clean || "imagem";
}

function extensionFromMime(mime: string) {
  const value = mime.toLowerCase();
  if (value.includes("png")) return "png";
  if (value.includes("webp")) return "webp";
  if (value.includes("gif")) return "gif";
  if (value.includes("avif")) return "avif";
  if (value.includes("svg")) return "svg";
  return "jpg";
}

function extensionFromUrl(url: string) {
  try {
    const pathname = new URL(url, window.location.href).pathname;
    const ext = pathname.split(".").pop()?.toLowerCase() ?? "";
    if (["png", "jpg", "jpeg", "webp", "gif", "avif", "svg"].includes(ext)) {
      return ext === "jpeg" ? "jpg" : ext;
    }
  } catch {
    // URL relativa inválida: usa o padrão.
  }
  return "";
}

function base64ToBytes(base64: string) {
  const binary = window.atob(base64.replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function loadImage(url: string) {
  if (url.startsWith("data:")) {
    const [header, payload = ""] = url.split(",");
    const mime = header.slice(5).split(";")[0] || "image/jpeg";
    const bytes = header.includes(";base64")
      ? base64ToBytes(payload)
      : new TextEncoder().encode(decodeURIComponent(payload));

    return { bytes, ext: extensionFromMime(mime), mime };
  }

  const response = await fetch(url, { mode: "cors" });
  if (!response.ok) throw new Error("Falha ao baixar a imagem.");

  const blob = await response.blob();
  const mime = blob.type || "image/jpeg";
  const ext = extensionFromUrl(url) || extensionFromMime(mime);

  return { bytes: new Uint8Array(await blob.arrayBuffer()), ext, mime };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

/** Baixa uma imagem (data URL ou link) com nome de arquivo amigável. */
export async function downloadImage(url: string, name: string) {
  const image = await loadImage(url);
  downloadBlob(
    new Blob([image.bytes], { type: image.mime }),
    `${slugify(name)}.${image.ext}`,
  );
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let value = i;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[i] = value >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array) {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    crc = crcTable[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createZip(files: { name: string; bytes: Uint8Array }[]) {
  const encoder = new TextEncoder();
  const now = new Date();
  const dosTime =
    (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate =
    ((now.getFullYear() - 1980) << 9) |
    ((now.getMonth() + 1) << 5) |
    now.getDate();

  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const nameBytes = encoder.encode(file.name);
    const crc = crc32(file.bytes);

    const local = new Uint8Array(30 + nameBytes.length);
    const localView = new DataView(local.buffer);
    localView.setUint32(0, 0x04034b50, true);
    localView.setUint16(4, 20, true);
    localView.setUint16(6, 0x0800, true);
    localView.setUint16(8, 0, true);
    localView.setUint16(10, dosTime, true);
    localView.setUint16(12, dosDate, true);
    localView.setUint32(14, crc, true);
    localView.setUint32(18, file.bytes.length, true);
    localView.setUint32(22, file.bytes.length, true);
    localView.setUint16(26, nameBytes.length, true);
    localView.setUint16(28, 0, true);
    local.set(nameBytes, 30);

    const central = new Uint8Array(46 + nameBytes.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint16(8, 0x0800, true);
    centralView.setUint16(10, 0, true);
    centralView.setUint16(12, dosTime, true);
    centralView.setUint16(14, dosDate, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, file.bytes.length, true);
    centralView.setUint32(24, file.bytes.length, true);
    centralView.setUint16(28, nameBytes.length, true);
    centralView.setUint16(30, 0, true);
    centralView.setUint16(32, 0, true);
    centralView.setUint16(34, 0, true);
    centralView.setUint16(36, 0, true);
    centralView.setUint32(38, 0, true);
    centralView.setUint32(42, offset, true);
    central.set(nameBytes, 46);

    localParts.push(local, file.bytes);
    centralParts.push(central);
    offset += local.length + file.bytes.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralSize, true);
  endView.setUint32(16, offset, true);

  return new Blob([...localParts, ...centralParts, end], {
    type: "application/zip",
  });
}

export async function buildImagesZip(images: DownloadableImage[]) {
  const files: { name: string; bytes: Uint8Array }[] = [];
  const usedNames = new Set<string>();
  let skipped = 0;

  for (const image of images) {
    if (!image.url.trim()) continue;

    try {
      const loaded = await loadImage(image.url);
      let name = `${slugify(image.name)}.${loaded.ext}`;
      let suffix = 2;
      while (usedNames.has(name)) {
        name = `${slugify(image.name)}-${suffix}.${loaded.ext}`;
        suffix += 1;
      }
      usedNames.add(name);
      files.push({ name, bytes: loaded.bytes });
    } catch {
      skipped += 1;
    }
  }

  if (files.length === 0) {
    return { blob: null as Blob | null, count: 0, skipped };
  }

  return { blob: createZip(files), count: files.length, skipped };
}
