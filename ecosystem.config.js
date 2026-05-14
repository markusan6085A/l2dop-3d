module.exports = {
  apps: [
    {
      name: 'text-rpg-api',
      cwd: '/opt/text-rpg/server',
      script: 'dist/index.js',
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
      error_file: '/var/log/text-rpg-api/error.log',
      out_file: '/var/log/text-rpg-api/out.log',
      log_file: '/var/log/text-rpg-api/combined.log',
      time: true,
      merge_logs: true,
    },
  ],
};
