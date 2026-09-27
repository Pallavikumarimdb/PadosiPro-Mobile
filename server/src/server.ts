import { buildApp, config } from './app.js';

const app = buildApp();

app.listen(config.port, '0.0.0.0', () => {
  console.log(`Backend listening on http://localhost:${config.port}`);
});
