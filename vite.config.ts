import { defineConfig, loadEnv, type Plugin } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";

type ApiHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  env: Record<string, string | undefined>,
) => Promise<void>;

type ApiRoute = {
  /** Caminho exato ou prefixo (quando `prefix` é true). */
  path: string;
  module: string;
  handler: string;
  prefix?: boolean;
};

/** Rotas de servidor servidas em desenvolvimento pelo Vite. */
const apiRoutes: ApiRoute[] = [
  { path: "/api/health", module: "server/health.mjs", handler: "handleHealthRequest" },
  {
    path: "/api/youtube/latest",
    module: "server/youtube.mjs",
    handler: "handleLatestVideoRequest",
  },
  { path: "/api/contact", module: "server/contact.mjs", handler: "handleContactRequest" },
  {
    path: "/api/admin/login",
    module: "server/admin-api.mjs",
    handler: "handleAdminLoginRequest",
  },
  {
    path: "/api/admin/logout",
    module: "server/admin-api.mjs",
    handler: "handleAdminLogoutRequest",
  },
  {
    path: "/api/admin/session",
    module: "server/admin-api.mjs",
    handler: "handleAdminSessionRequest",
  },
  {
    path: "/api/content",
    module: "server/content-api.mjs",
    handler: "handleContentGetRequest",
  },
  {
    path: "/api/admin/content",
    module: "server/content-api.mjs",
    handler: "handleContentPutRequest",
  },
  {
    path: "/api/admin/media",
    module: "server/media-api.mjs",
    handler: "handleMediaUploadRequest",
  },
  {
    path: "/api/media/",
    module: "server/media-api.mjs",
    handler: "handleMediaRequest",
    prefix: true,
  },
];

function findRoute(pathname: string) {
  const exact = apiRoutes.find((route) => !route.prefix && route.path === pathname);
  if (exact) return exact;
  return apiRoutes.find((route) => route.prefix && pathname.startsWith(route.path));
}

/**
 * Em desenvolvimento o Vite serve as mesmas rotas de API do servidor de
 * produção (pasta server/), lendo as credenciais do .env. Chaves de YouTube,
 * senha do SMTP e credenciais do banco nunca vão para o bundle do cliente.
 */
function siteApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: "site-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? "").split("?")[0];
        const route = findRoute(pathname);

        if (!route) {
          next();
          return;
        }

        void (async () => {
          try {
            const moduleUrl = pathToFileURL(
              path.resolve(__dirname, route.module),
            ).href;
            const mod = (await import(/* @vite-ignore */ moduleUrl)) as Record<
              string,
              ApiHandler
            >;
            await mod[route.handler](req, res, { ...env, ...process.env });
          } catch (error) {
            console.error(`[site-api] falha em ${pathname}`, error);
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(JSON.stringify({ error: "internal_error" }));
          }
        })();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [dyadComponentTagger(), react(), siteApiPlugin(env)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
