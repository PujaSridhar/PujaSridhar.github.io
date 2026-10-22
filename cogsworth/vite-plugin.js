// cogsworth/vite-plugin.js
// Dev-only: serves POST /api/chat from the local engine so the real terminal UI
// can be tried against it. Enabled by `npm run dev:local`; production builds and
// the plain `npm run dev` proxy to Vercel are untouched.

export function cogsworthLocal() {
  return {
    name: 'cogsworth-local',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res, next) => {
        if (req.method !== 'POST') return next();
        try {
          let body = '';
          for await (const chunk of req) body += chunk;
          const { prompt, conversationHistory } = JSON.parse(body || '{}');
          if (!prompt) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Prompt is required' }));
          }

          // ssrLoadModule picks up edits to portfolio-data.js and the engine without a restart.
          const { createEngine } = await server.ssrLoadModule('/cogsworth/engine.js');
          const { portfolioData } = await server.ssrLoadModule('/portfolio-data.js');
          const result = createEngine(portfolioData).answer(prompt, conversationHistory || []);
          server.config.logger.info(`[cogsworth] ${result.intent}${result.entity ? ` (${result.entity})` : ''}: ${prompt}`);

          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          // Stream word by word so the terminal's typing effect behaves as it does with Gemini.
          for (const piece of result.text.match(/\S+\s*/g) || []) {
            res.write(piece);
            await new Promise(resolve => setTimeout(resolve, 12));
          }
          res.end();
        } catch (error) {
          server.config.logger.error(`[cogsworth] ${error.stack}`);
          if (!res.headersSent) res.statusCode = 500;
          res.end();
        }
      });
    },
  };
}
