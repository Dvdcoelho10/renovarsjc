-- Banco oficial: MySQL na Hostinger (phpMyAdmin).
-- Aplique este arquivo no phpMyAdmin, dentro do banco criado no hPanel.
-- As credenciais de conexão ficam apenas no .env / variáveis da Hostinger.

CREATE TABLE IF NOT EXISTS site_content (
  id TINYINT UNSIGNED NOT NULL,
  payload JSON NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Linha única com o conteúdo editável do site.
INSERT INTO site_content (id, payload)
VALUES (1, JSON_OBJECT())
ON DUPLICATE KEY UPDATE id = id;
