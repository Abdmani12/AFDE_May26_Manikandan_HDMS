require('dotenv').config();
const { initializeDB } = require('./database/init');
const { startSLAChecker } = require('./src/utils/slaChecker');
const app = require('./src/app');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await initializeDB();
    console.log('[DB] Database initialized successfully');
  } catch (err) {
    console.error('[DB] Failed to initialize database:', err.message);
    process.exit(1);
  }

  startSLAChecker();

  app.listen(PORT, () => {
    console.log(`[Server] CCRTS Backend running on http://localhost:${PORT}`);
    console.log(`[Server] API Health: http://localhost:${PORT}/api/health`);
  });
})();
