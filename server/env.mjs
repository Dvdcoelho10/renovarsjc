/**
 * Leitura das variáveis de ambiente do servidor.
 * Em produção valem as variáveis do hPanel (process.env); em desenvolvimento,
 * o arquivo .env na raiz do projeto completa o que faltar.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export function parseEnvFile(file) {
  const values = {};
  if (!existsSync(file)) return values;

  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }

  return values;
}

/** .env primeiro, process.env por cima (variáveis do hPanel mandam). */
export function loadServerEnv(root) {
  return { ...parseEnvFile(path.join(root, ".env")), ...process.env };
}
