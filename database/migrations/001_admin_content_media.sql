-- ---------------------------------------------------------------------------
-- 001 — Conteúdo compartilhado, autenticação administrativa e mídia.
--
-- IMPORTANTE
--  * Não execute este arquivo sem autorização do responsável pelo projeto.
--  * É idempotente e NÃO destrutivo: só usa CREATE TABLE IF NOT EXISTS e
--    INSERT ... ON DUPLICATE KEY UPDATE. Nenhum DROP/TRUNCATE/ALTER.
--  * Rode depois de criar o banco no hPanel (Hostinger) e selecionar esse banco
--    no phpMyAdmin.
--  * Compatível com MySQL 8 e MariaDB 10.2+ (tipo JSON e utf8mb4).
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(64) NOT NULL,
  applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (version)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Conteúdo público do site: linha única (id = 1) com o JSON editável no painel.
-- Mesmo formato de src/content/site.ts (SiteContent), para o frontend não mudar.
CREATE TABLE IF NOT EXISTS site_content (
  id TINYINT UNSIGNED NOT NULL,
  payload JSON NOT NULL,
  updated_by VARCHAR(190) NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Usuários do painel. A senha nunca é gravada em texto puro:
-- password_hash guarda "scrypt$N$r$p$saltBase64$hashBase64".
CREATE TABLE IF NOT EXISTS admin_users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY admin_users_email_unique (email)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Sessões: guarda apenas o SHA-256 do token. O token original fica só no
-- cookie HttpOnly do navegador, então um vazamento do banco não dá sessão.
CREATE TABLE IF NOT EXISTS admin_sessions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  ip_hash CHAR(64) NULL,
  user_agent VARCHAR(255) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY admin_sessions_token_unique (token_hash),
  KEY admin_sessions_expires_idx (expires_at),
  CONSTRAINT admin_sessions_user_fk
    FOREIGN KEY (user_id) REFERENCES admin_users (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Tentativas de login para bloquear força bruta (e-mail e IP são guardados
-- como hash, não em texto puro).
CREATE TABLE IF NOT EXISTS login_attempts (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  identifier_hash CHAR(64) NOT NULL,
  ip_hash CHAR(64) NOT NULL,
  succeeded TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY login_attempts_identifier_idx (identifier_hash, created_at),
  KEY login_attempts_ip_idx (ip_hash, created_at)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- Imagens enviadas pelo painel. Ficam no banco (e não em dist/ nem em disco),
-- para sobreviver a builds e redeploys na Hostinger. O site referencia
-- /api/media/{id}.
CREATE TABLE IF NOT EXISTS media (
  id CHAR(36) NOT NULL,
  mime_type VARCHAR(32) NOT NULL,
  byte_size INT UNSIGNED NOT NULL,
  sha256 CHAR(64) NOT NULL,
  data LONGBLOB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY media_sha256_unique (sha256)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

INSERT INTO schema_migrations (version)
VALUES ('001_admin_content_media')
ON DUPLICATE KEY UPDATE version = version;
