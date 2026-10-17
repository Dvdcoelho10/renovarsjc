import { Plus, Trash2 } from "lucide-react";

import {
  AdminField,
  AdminSection,
  TextAreaField,
  TextField,
} from "@/components/admin/fields";
import { createId } from "@/components/admin/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MessageItem, MessageKind, SiteContent } from "@/content/site";

type Props = {
  content: SiteContent;
  onChange: (next: SiteContent) => void;
};

export function MessagesForm({ content, onChange }: Props) {
  const messages = content.messages;

  const patchMessage = <K extends keyof MessageItem>(
    index: number,
    key: K,
    value: MessageItem[K],
  ) =>
    onChange({
      ...content,
      messages: messages.map((message, position) =>
        position === index ? { ...message, [key]: value } : message,
      ),
    });

  const addMessage = () =>
    onChange({
      ...content,
      messages: [
        ...messages,
        {
          id: createId("message"),
          kind: "reflexao" as MessageKind,
          title: "",
          summary: "",
          body: "",
          author: "",
          publishedAt: "",
          videoUrl: "",
          imageUrl: "",
        },
      ],
    });

  const removeMessage = (index: number) =>
    onChange({
      ...content,
      messages: messages.filter((_, position) => position !== index),
    });

  return (
    <AdminSection
      title="Mensagens e conteúdos"
      description="A página Mensagens e o item no menu aparecem apenas quando existir pelo menos uma publicação."
    >
      {messages.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border bg-background/60 p-5 text-sm leading-relaxed text-muted-foreground">
          Nenhuma mensagem publicada. Publique apenas reflexões, estudos e vídeos
          fornecidos pela igreja.
        </p>
      )}

      {messages.map((message, index) => (
        <div
          key={message.id}
          className="grid gap-4 rounded-2xl border border-border/70 bg-background/40 p-4 sm:p-5"
        >
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-foreground">
              Publicação {index + 1}
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeMessage(index)}
              className="rounded-full text-xs text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
              Remover
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <AdminField label="Tipo">
              <Select
                value={message.kind}
                onValueChange={(value) =>
                  patchMessage(index, "kind", value as MessageKind)
                }
              >
                <SelectTrigger className="h-11 rounded-xl border-border bg-background">
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reflexao">Reflexão</SelectItem>
                  <SelectItem value="estudo">Estudo bíblico</SelectItem>
                  <SelectItem value="video">Vídeo</SelectItem>
                </SelectContent>
              </Select>
            </AdminField>

            <TextField
              id={`message-date-${message.id}`}
              label="Data de publicação"
              type="date"
              value={message.publishedAt}
              onChange={(value) => patchMessage(index, "publishedAt", value)}
            />
          </div>

          <TextField
            id={`message-title-${message.id}`}
            label="Título"
            value={message.title}
            onChange={(value) => patchMessage(index, "title", value)}
          />
          <TextAreaField
            id={`message-summary-${message.id}`}
            label="Resumo"
            value={message.summary}
            onChange={(value) => patchMessage(index, "summary", value)}
          />
          <TextAreaField
            id={`message-body-${message.id}`}
            label="Conteúdo (opcional)"
            value={message.body ?? ""}
            onChange={(value) => patchMessage(index, "body", value)}
            rows={5}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              id={`message-author-${message.id}`}
              label="Autor (opcional)"
              value={message.author ?? ""}
              onChange={(value) => patchMessage(index, "author", value)}
              hint="Preencha apenas se a autoria for informada pela igreja."
            />
            <TextField
              id={`message-video-${message.id}`}
              label="Link do vídeo (opcional)"
              type="url"
              value={message.videoUrl ?? ""}
              onChange={(value) => patchMessage(index, "videoUrl", value)}
              placeholder="https://youtube.com/..."
            />
          </div>
          <TextField
            id={`message-image-${message.id}`}
            label="Imagem (URL, opcional)"
            type="url"
            value={message.imageUrl ?? ""}
            onChange={(value) => patchMessage(index, "imageUrl", value)}
            placeholder="https://.../foto.jpg"
          />
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addMessage}
        className="w-fit rounded-full border-border hover:bg-secondary"
      >
        <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
        Adicionar mensagem
      </Button>
    </AdminSection>
  );
}
