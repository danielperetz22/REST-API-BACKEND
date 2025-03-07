module.exports = {
  apps : [{
    name : "REST-API-BACKEND",
    script : "./dist/app.js",
    env_production: {
      NODE_ENV: "production"
    }
  }],
  deploy : {
    production : {
      // ...
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production'
    }
  }
}
