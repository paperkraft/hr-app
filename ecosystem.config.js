module.exports = {
  apps: [
    {
      name: 'hr-app',
      script: 'server.js',
      cwd: './.next/standalone',
      env: {
        NODE_ENV: 'production',
        PORT: 7000,
        DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/hr-app?schema=public', // Update with production DB
        NEXTAUTH_SECRET: '...',         // Update with production secret
        NEXTAUTH_URL: 'http://localhost:7000',
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
