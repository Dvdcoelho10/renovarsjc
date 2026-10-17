const MAX_DIMENSION = 1500;
const MAX_FILE_BYTES = 12 * 1024 * 1024;

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Arquivo de imagem inválido."));
    image.src = src;
  });
}

/**
 * Lê uma imagem escolhida no painel, reduz o tamanho e devolve um data URL
 * otimizado para ser salvo junto com o conteúdo.
 */
export async function optimizeImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecione um arquivo de imagem (JPG, PNG ou WebP).");
  }
  if (file.size > MAX_FILE_BYTES) {
    throw new Error("A imagem é muito grande. Use um arquivo de até 12 MB.");
  }

  const original = await readAsDataUrl(file);
  const image = await loadImage(original);
  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(image.width, image.height),
  );

  if (scale === 1 && original.length < 300_000) {
    return original;
  }

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext("2d");
  if (!context) return original;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const webp = canvas.toDataURL("image/webp", 0.82);
  if (webp.startsWith("data:image/webp")) return webp;

  // Navegadores sem WebP: PNG preserva transparência da logo.
  return canvas.toDataURL("image/png");
}
