import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export function AdminSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-border/80 bg-card p-5 sm:p-7",
        className,
      )}
    >
      <h2 className="text-lg">{title}</h2>
      {description && (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      <div className="mt-5 grid gap-4">{children}</div>
    </section>
  );
}

export function AdminField({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label
        htmlFor={htmlFor}
        className="text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground"
      >
        {label}
      </Label>
      {children}
      {hint && (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

type TextFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  type?: "text" | "email" | "url" | "date" | "time" | "tel";
};

export function TextField({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
}: TextFieldProps) {
  return (
    <AdminField label={label} hint={hint} htmlFor={id}>
      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border-border bg-background"
      />
    </AdminField>
  );
}

type TextAreaFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  rows?: number;
};

export function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  rows = 3,
}: TextAreaFieldProps) {
  return (
    <AdminField label={label} hint={hint} htmlFor={id}>
      <Textarea
        id={id}
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-[5rem] rounded-xl border-border bg-background leading-relaxed"
      />
    </AdminField>
  );
}
