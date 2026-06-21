module.exports = {
  apps: [
    {
      name: 'reklama-bot-backend',
      script: './backend/dist/src/main.js',
      instances: 1,
      exec_mode: 'cluster',
      autorestart: true,
      watch: false,
      max_memory_restart: '1500M',
      cron_restart: '0 */6 * * *', // Har 6 soatda restart (2 soat juda tez — sessionlar qayta ulanadi)
      env: {
        NODE_ENV: 'production',
        TZ: 'Asia/Tashkent',
        UV_THREADPOOL_SIZE: '128',
      },
      node_args: '--max-old-space-size=1024',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    },
  ],
};
