module.exports = {
  apps: [{
    name: 'untrapd-ecosystem',
    script: './server.js',
    cwd: '/var/www/untrapd',
    instances: 'max',
    exec_mode: 'cluster',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/untrapd/error.log',
    out_file: '/var/log/untrapd/out.log',
    log_file: '/var/log/untrapd/combined.log',
    time: true
  }]
};
