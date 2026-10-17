import { defineConfig, loadEnv, type Plugin } from "vite";
import dyadComponentTagger from "@dyad-sh/react-vite-component-tagger";
import react from "@vitejs/plugin-react-swc";
import type { IncomingMessage, ServerResponse } from "node:http";
import path from "node:path";
import { pathToFileURL } from "node:url";

type YoutubeHandler = (
  req: IncomingMessage,
  res: ServerResponse,
  env: Record<string, string | undefined>,
) => Promise<void>;

/**
 * Em desenvolvimento o Vite serve a mesma rota de API do servidor de produção
 * (server/youtube.mjs), lendo as credenciais do .env. A chave nunca vai para
 * o bundle do cliente.
 */
function youtubeApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: "youtube-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = (req.url ?? "").split("?")[0];
        if (pathname !== "/api/youtube/latest") {
          next();
          return;
        }

        void (async () => {
          try {
            const moduleUrl = pathToFileURL(
              path.resolve(__dirname, "server/youtube.mjs"),
            ).href;
            const mod = (await import(/* @vite-ignore */ moduleUrl)) as {
              handleLatestVideoRequest: YoutubeHandler;
            };
            await mod.handleLatestVideoRequest(req, res, {
              ...env,
              ...process.env,
            });
          } catch (error) {
            console.error("[youtube-api] falha ao processar a requisição", error);
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
    plugins: [dyadComponentTagger(), react(), youtubeApiPlugin(env)],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
