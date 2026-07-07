/** pm2: запуск з кореня репо l2dop-3d (не з server/). */
module.exports = {
  apps: [
    {
      name: 'l2dop-3d',
      cwd: __dirname,
      script: 'dist/server/src/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '700M',
      min_uptime: '10s',
      max_restarts: 10,
      restart_delay: 3000,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '/var/log/l2dop-3d/error.log',
      out_file: '/var/log/l2dop-3d/out.log',
      log_file: '/var/log/l2dop-3d/combined.log',
      time: true,
      merge_logs: true,
    },
  ],
};
