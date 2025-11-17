# Production Deployment Guide

Complete guide for deploying your telehealth video calling system to production.

## Prerequisites

- Domain name with SSL certificate
- MongoDB Atlas account (or self-hosted MongoDB)
- Server with Node.js installed
- TURN server (Coturn) for NAT traversal

## 1. MongoDB Setup (MongoDB Atlas)

### Create Cluster
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create database user
4. Whitelist IP addresses (or allow from anywhere: 0.0.0.0/0)
5. Get connection string

### Connection String Format
```
mongodb+srv://username:password@cluster.mongodb.net/telehealth?retryWrites=true&w=majority
```

## 2. TURN Server Setup (Coturn)

### Install Coturn (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install coturn
```

### Configure Coturn
Edit `/etc/turnserver.conf`:

```conf
# Listening port
listening-port=3478

# External IP (your server's public IP)
external-ip=YOUR_SERVER_IP

# Relay IP (usually same as external IP)
relay-ip=YOUR_SERVER_IP

# Fingerprint
fingerprint

# Long-term credential mechanism
lt-cred-mech

# User credentials
user=turnuser:turnpassword

# Realm
realm=yourdomain.com

# Log file
log-file=/var/log/turnserver.log

# Verbose logging (disable in production)
# verbose
```

### Enable and Start Coturn
```bash
sudo systemctl enable coturn
sudo systemctl start coturn
sudo systemctl status coturn
```

### Test TURN Server
Use https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/

## 3. Backend Deployment

### Option A: VPS (DigitalOcean, AWS EC2, etc.)

#### Install Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### Install PM2
```bash
sudo npm install -g pm2
```

#### Clone and Setup
```bash
cd /var/www
git clone your-repo.git telehealth
cd telehealth/backend
npm install --production
```

#### Create Production .env
```bash
nano .env
```

```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/telehealth
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

#### Start with PM2
```bash
pm2 start server.js --name telehealth-api
pm2 save
pm2 startup
```

#### Setup Nginx Reverse Proxy
```bash
sudo apt-get install nginx
sudo nano /etc/nginx/sites-available/telehealth-api
```

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/telehealth-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Setup SSL with Let's Encrypt
```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### Option B: Heroku

#### Install Heroku CLI
```bash
npm install -g heroku
```

#### Login and Create App
```bash
heroku login
cd backend
heroku create telehealth-api
```

#### Set Environment Variables
```bash
heroku config:set MONGODB_URI="mongodb+srv://..."
heroku config:set CORS_ORIGIN="https://yourdomain.com"
heroku config:set NODE_ENV=production
```

#### Deploy
```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

## 4. Frontend Deployment

### Build Frontend
```bash
cd frontend
npm install
npm run build
```

### Option A: Vercel

#### Install Vercel CLI
```bash
npm install -g vercel
```

#### Deploy
```bash
vercel
```

#### Set Environment Variables
In Vercel dashboard:
- `VITE_SOCKET_URL=https://api.yourdomain.com`
- `VITE_API_URL=https://api.yourdomain.com/api`

### Option B: Netlify

#### Install Netlify CLI
```bash
npm install -g netlify-cli
```

#### Deploy
```bash
netlify deploy --prod
```

#### Configure Environment Variables
In Netlify dashboard, add:
- `VITE_SOCKET_URL`
- `VITE_API_URL`

### Option C: Static Hosting (Nginx)

#### Copy Build Files
```bash
sudo cp -r dist/* /var/www/html/
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

#### Setup SSL
```bash
sudo certbot --nginx -d yourdomain.com
```

## 5. Update WebRTC Configuration

Edit `frontend/src/utils/webrtcConfig.js`:

```javascript
export const ICE_SERVERS = {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302'
    },
    {
      urls: 'turn:yourdomain.com:3478',
      username: 'turnuser',
      credential: 'turnpassword'
    }
  ]
};
```

Rebuild and redeploy frontend.

## 6. Security Hardening

### Backend Security

#### Install Helmet
```bash
npm install helmet
```

Add to `server.js`:
```javascript
const helmet = require('helmet');
app.use(helmet());
```

#### Rate Limiting
```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

#### Environment Variables
Never commit `.env` files. Use secrets management:
- AWS Secrets Manager
- HashiCorp Vault
- Environment variables in hosting platform

### Database Security
- Enable MongoDB authentication
- Use IP whitelisting
- Enable encryption at rest
- Regular backups
- Monitor for suspicious activity

### Network Security
- Use HTTPS everywhere
- Enable CORS only for your domain
- Use WSS (WebSocket Secure)
- Implement firewall rules
- DDoS protection (Cloudflare)

## 7. Monitoring Setup

### PM2 Monitoring
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Application Monitoring
Consider using:
- New Relic
- Datadog
- Sentry (for error tracking)

### Uptime Monitoring
- UptimeRobot
- Pingdom
- StatusCake

## 8. Performance Optimization

### Enable Gzip Compression
In Nginx:
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;
```

### CDN Setup
Use Cloudflare or AWS CloudFront for:
- Static asset delivery
- DDoS protection
- SSL/TLS
- Caching

### Database Indexing
```javascript
// In Meeting.js model
meetingSchema.index({ roomId: 1 });
meetingSchema.index({ appointmentId: 1 });
meetingSchema.index({ status: 1, scheduledTime: -1 });
```

## 9. Backup Strategy

### MongoDB Backups
```bash
# Manual backup
mongodump --uri="mongodb+srv://..." --out=/backup/$(date +%Y%m%d)

# Automated daily backup (cron)
0 2 * * * mongodump --uri="mongodb+srv://..." --out=/backup/$(date +\%Y\%m\%d)
```

### Application Backups
- Use Git for version control
- Regular database snapshots
- Backup environment configurations

## 10. Testing in Production

### Smoke Tests
1. Create a meeting via API
2. Join from two different devices/networks
3. Test all features (mute, video, screen share, chat)
4. Test on different browsers
5. Test on mobile devices
6. Test with poor network conditions

### Load Testing
Use tools like:
- Apache JMeter
- Artillery
- k6

Example Artillery test:
```yaml
config:
  target: 'https://api.yourdomain.com'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: 'Create Meeting'
    flow:
      - post:
          url: '/api/create-meeting'
          json:
            appointmentId: 'test-{{ $randomString() }}'
            doctorId: 'doctor-123'
            patientId: 'patient-456'
```

## 11. Rollback Plan

### Quick Rollback with PM2
```bash
# List deployments
pm2 list

# Rollback to previous version
git checkout previous-commit
npm install
pm2 restart telehealth-api
```

### Database Rollback
```bash
# Restore from backup
mongorestore --uri="mongodb+srv://..." /backup/20240115
```

## 12. Post-Deployment Checklist

- [ ] SSL certificates installed and working
- [ ] Environment variables configured
- [ ] TURN server tested and working
- [ ] Database backups scheduled
- [ ] Monitoring and alerts configured
- [ ] Error tracking enabled
- [ ] Load testing completed
- [ ] Security audit performed
- [ ] Documentation updated
- [ ] Team trained on deployment process

## 13. Maintenance

### Regular Tasks
- Monitor server resources (CPU, RAM, disk)
- Review error logs weekly
- Update dependencies monthly
- Renew SSL certificates (auto with Let's Encrypt)
- Review and optimize database queries
- Test backup restoration quarterly

### Updates
```bash
# Update backend dependencies
cd backend
npm update
npm audit fix

# Update frontend dependencies
cd frontend
npm update
npm audit fix
```

## Support & Troubleshooting

### Common Issues

**Socket.io not connecting**
- Check CORS settings
- Verify WSS is enabled
- Check firewall rules

**Video not working**
- Verify TURN server is running
- Check STUN/TURN configuration
- Test with https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/

**High latency**
- Use CDN for static assets
- Optimize database queries
- Consider regional deployments

### Getting Help
- Check application logs: `pm2 logs telehealth-api`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check TURN logs: `sudo tail -f /var/log/turnserver.log`

## Conclusion

Your telehealth video calling system is now production-ready! Remember to:
- Monitor regularly
- Keep dependencies updated
- Test new features thoroughly
- Maintain good documentation
- Have a rollback plan ready
