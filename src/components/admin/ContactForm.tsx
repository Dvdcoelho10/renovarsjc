import {
  AdminSection,
  TextAreaField,
  TextField,
} from "@/components/admin/fields";
import type { SiteContent } from "@/content/site";

type Props = {
  content: SiteContent;
  onChange: (next: SiteContent) => void;
};

export function ContactForm({ content, onChange }: Props) {
  const contact = content.contact;

  const patch = <K extends keyof Omit<typeof contact, "social">>(
    key: K,
    value: string,
  ) => onChange({ ...content, contact: { ...contact, [key]: value } });

  const patchSocial = <K extends keyof typeof contact.social>(
    key: K,
    value: string,
  ) =>
    onChange({
      ...content,
      contact: { ...contact, social: { ...contact.social, [key]: value } },
    });

  return (
    <div className="grid gap-5">
      <AdminSection
        title="Canais de contato"
        description="Canais em branco não aparecem no site. A página Contato só exibe o que estiver preenchido."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="contact-phone"
            label="Telefone"
            type="tel"
            value={contact.phone}
            onChange={(value) => patch("phone", value)}
            placeholder="(12) 3000-0000"
            hint="Aparece como link de ligação."
          />
          <TextField
            id="contact-whatsapp"
            label="WhatsApp"
            type="tel"
            value={contact.whatsapp}
            onChange={(value) => patch("whatsapp", value)}
            placeholder="(12) 90000-0000"
            hint="Abre a conversa no WhatsApp."
          />
          <TextField
            id="contact-email"
            label="E-mail"
            type="email"
            value={contact.email}
            onChange={(value) => patch("email", value)}
            placeholder="contato@igreja.com.br"
          />
        </div>
      </AdminSection>

      <AdminSection
        title="Redes sociais"
        description="Cole o endereço completo do perfil oficial. Deixe vazio para não exibir."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            id="contact-instagram"
            label="Instagram"
            type="url"
            value={contact.social.instagram}
            onChange={(value) => patchSocial("instagram", value)}
            placeholder="https://instagram.com/..."
          />
          <TextField
            id="contact-facebook"
            label="Facebook"
            type="url"
            value={contact.social.facebook}
            onChange={(value) => patchSocial("facebook", value)}
            placeholder="https://facebook.com/..."
          />
          <TextField
            id="contact-youtube"
            label="YouTube"
            type="url"
            value={contact.social.youtube}
            onChange={(value) => patchSocial("youtube", value)}
            placeholder="https://youtube.com/..."
          />
        </div>
      </AdminSection>

      <AdminSection
        title="Endereço e localização"
        description="O endereço do estatuto é provisório. Publique apenas o endereço atual confirmado pela liderança."
      >
        <TextField
          id="contact-address"
          label="Endereço completo"
          value={contact.address}
          onChange={(value) => patch("address", value)}
          placeholder="Rua, número, bairro, cidade — SP"
          hint="Enquanto estiver vazio, o site informa que o endereço ainda não foi publicado."
        />
        <TextField
          id="contact-complement"
          label="Complemento"
          value={contact.addressComplement}
          onChange={(value) => patch("addressComplement", value)}
          placeholder="Ponto de referência, estacionamento..."
        />
        <TextField
          id="contact-map"
          label="Mapa (link de incorporação)"
          type="url"
          value={contact.mapEmbedUrl}
          onChange={(value) => patch("mapEmbedUrl", value)}
          placeholder="https://www.google.com/maps?q=...&output=embed"
          hint="Só exibido quando endereço, mapa e rota estiverem preenchidos."
        />
        <TextField
          id="contact-directions"
          label="Rota (link do Google Maps ou Waze)"
          type="url"
          value={contact.directionsUrl}
          onChange={(value) => patch("directionsUrl", value)}
          placeholder="https://www.google.com/maps/dir/?api=1&destination=..."
        />
        <TextAreaField
          id="contact-location-note"
          label="Aviso do bloco “Localização”"
          value={contact.locationNote}
          onChange={(value) => patch("locationNote", value)}
          hint="Exibido enquanto o endereço atual não estiver confirmado."
        />
        <TextAreaField
          id="contact-visit-note"
          label="Texto do bloco “Visite a igreja”"
          value={contact.visitNote}
          onChange={(value) => patch("visitNote", value)}
        />
      </AdminSection>
    </div>
  );
}
