# RBBSec Initial Launch Website




Resource Group: Website
VM: API (Linux and running Ubuntu)

/etc/nginx/sites-available/api.rbbsec.com

```
server {
    listen 80;
    server_name api.rbbsec.com;

    location /api/submitScore {
        proxy_pass https://snek-api-huhkdfbbcrbwcvhf.australiaeast-01.azurewebsites.net/api/submitScore;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /api/getLeaderboard {
        proxy_pass https://snek-api-huhkdfbbcrbwcvhf.australiaeast-01.azurewebsites.net/api/getLeaderboard;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Redirect anything else to main website
        location / {
        return 301 https://www.rbbsec.com;
    }
}
```