module.exports = {
  apps: [
    {
      name: 'hr-app',
      script: 'server.js',
      cwd: './.next/standalone',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        DATABASE_URL: 'postgresql://...', // Update with production DB
        NEXTAUTH_SECRET: '...',         // Update with production secret
        NEXTAUTH_URL: 'http://your-domain.com',
        CRON_SECRET: '...',             // Update for security
      },
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
