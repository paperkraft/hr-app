const fs = require('fs');
const path = require('path');

async function buildStandalone() {
  const rootDir = process.cwd();
  const standaloneDir = path.join(rootDir, '.next', 'standalone');
  const staticDir = path.join(rootDir, '.next', 'static');
  const publicDir = path.join(rootDir, 'public');

  console.log('🚀 Preparing standalone build folder...');

  try {
    // 1. Copy public folder
    if (fs.existsSync(publicDir)) {
      console.log('📦 Copying /public to /.next/standalone/public...');
      fs.cpSync(publicDir, path.join(standaloneDir, 'public'), { recursive: true });
    }

    // 2. Copy static folder
    if (fs.existsSync(staticDir)) {
      console.log('📦 Copying /.next/static to /.next/standalone/.next/static...');
      const standaloneStaticDir = path.join(standaloneDir, '.next', 'static');
      if (!fs.existsSync(path.dirname(standaloneStaticDir))) {
        fs.mkdirSync(path.dirname(standaloneStaticDir), { recursive: true });
      }
      fs.cpSync(staticDir, standaloneStaticDir, { recursive: true });
    }

    console.log('✅ Standalone build is ready in .next/standalone');
    console.log('💡 You can now run: pm2 start ecosystem.config.js');
  } catch (err) {
    console.error('❌ Error preparing standalone build:', err);
    process.exit(1);
  }
}

buildStandalone();
