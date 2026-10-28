import { useRef, useState } from "react";
import { Download, ImagePlus, Trash2 } from "lucide-react";

import { AdminField } from "@/components/admin/fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { optimizeImageFile } from "@/lib/image";
import { downloadImage } from "@/lib/images-download";
import { uploadErrorMessages, uploadImage } from "@/lib/media";

type ImageFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  /** Classe de altura da pré-visualização. */
  previewClassName?: string;
};

export function ImageField({
  id,
  label,
  value,
  onChange,
  hint,
  previewClassName = "h-40",
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setError("");
    setDownloading(true);
    try {
      await downloadImage(value, label);
    } catch {
      setError(
        "Não foi possível baixar esta imagem. Links externos podem bloquear o download.",
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleFile = async (file: File) => {
    setError("");
    setLoading(true);
    try {
      // 1. Reduz a imagem no navegador (WebP) e 2. guarda no servidor,
      // que devolve o endereço público /api/media/{id}.
      const optimized = await optimizeImageFile(file);
      const uploaded = await uploadImage(optimized);

      if (!uploaded.ok) {
        setError(
          uploadErrorMessages[uploaded.error] ??
            "Não foi possível enviar a imagem.",
        );
        return;
      }

      onChange(uploaded.url);
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Não foi possível enviar a imagem.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminField label={label} hint={hint} htmlFor={id}>
      <div className="grid gap-2.5">
        {value ? (
          <img
            src={value}
            alt="Pré-visualização da imagem"
            className={`w-full rounded-xl border border-border bg-secondary/60 object-contain ${previewClassName}`}
          />
        ) : (
          <div
            className={`flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-background/60 text-xs text-muted-foreground ${previewClassName}`}
          >
            <ImagePlus className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
            Nenhuma imagem definida
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="rounded-full border-border hover:bg-secondary"
          >
            <ImagePlus className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {loading ? "Enviando..." : value ? "Trocar imagem" : "Enviar imagem"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!value || downloading}
            onClick={handleDownload}
            className="rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Download className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            {downloading ? "Baixando..." : "Baixar"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={!value}
            onClick={() => {
              onChange("");
              setError("");
            }}
            className="rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            Remover
          </Button>
        </div>

        <Input
          id={id}
          value={value.startsWith("data:") ? "" : value}
          placeholder={
            value.startsWith("data:")
              ? "Imagem enviada do computador"
              : "https://.../imagem.jpg"
          }
          onChange={(event) => onChange(event.target.value)}
          className="h-11 rounded-xl border-border bg-background text-sm"
        />
        <p className="text-xs leading-relaxed text-muted-foreground">
          Envie uma foto do computador (JPG, PNG ou WebP, até 3 MB) ou cole um
          link. O arquivo enviado fica guardado no servidor e aparece para todos
          os visitantes.
        </p>

        {error && (
          <p role="alert" className="text-xs text-destructive">
            {error}
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleFile(file);
            event.target.value = "";
          }}
        />
      </div>
    </AdminField>
  );
}
