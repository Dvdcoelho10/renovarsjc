/**
 * Envio de imagens do painel para o servidor (tabela `media` do MySQL).
 * A imagem chega como data URL já otimizada em `src/lib/image.ts` e o servidor
 * devolve o endereço público /api/media/{id} para ser salvo no conteúdo.
 */
export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

const UPLOAD_ENDPOINT = "/api/admin/media";

export const uploadErrorMessages: Record<string, string> = {
  db_not_configured:
    "O banco de dados ainda não está configurado no servidor, então a imagem não pode ser guardada.",
  unauthorized:
    "Sua sessão expirou. Entre novamente no painel para enviar imagens.",
  invalid_image:
    "Arquivo de imagem inválido. Use JPG, PNG ou WebP.",
  image_too_large:
    "A imagem ficou grande demais. Use um arquivo menor ou recorte a foto.",
  upload_failed:
    "Não foi possível guardar a imagem agora. Tente novamente em instantes.",
  network_error:
    "Sem conexão com o servidor. Verifique sua internet e tente novamente.",
};

export async function uploadImage(dataUrl: string): Promise<UploadResult> {
  try {
    const response = await fetch(UPLOAD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ dataUrl }),
    });

    const data = (await response.json().catch(() => ({}))) as {
      url?: string;
      error?: string;
    };

    if (!response.ok || typeof data?.url !== "string") {
      return {
        ok: false,
        error: typeof data?.error === "string" ? data.error : "upload_failed",
      };
    }

    return { ok: true, url: data.url };
  } catch {
    return { ok: false, error: "network_error" };
  }
}
