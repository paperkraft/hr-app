module.exports = {
  apps: [
    {
      name: 'hr-app',
      script: 'server.js',
      cwd: './.next/standalone',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        DATABASE_URL: 'postgresql://postgres:Admin%40123@localhost:5432/hrms?schema=public',
        NEXTAUTH_SECRET: '4mDvU/BZRx6HOuYxgrwmS4MVLjxHlaOJHjo0Mgh4Sbc=',
        NEXTAUTH_URL: 'https://hrms.infraplan.co.in',
        NEXTAUTH_URL_INTERNAL: 'http://localhost:5000',
        TRUST_HOST: true,
        CRON_SECRET: 'royalsv105',
        NEXT_PUBLIC_VAPID_PUBLIC_KEY: 'BCNf9uoIEhtGfLvkwAz9WziiQxNF6PcN5_en51qEY8GZcvAAUO2d2Z8u_U-hUaryjlhwZ0QIgJk_CzbWeqqONZc',
        VAPID_PRIVATE_KEY: 'qrlaquKYHfANCKJMemVg1DAWEJKu8b3akt1-AGsaQB4'
      },
      instances: 'max',
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};

