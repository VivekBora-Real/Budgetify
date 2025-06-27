# Frontend Deployment Guide

## Issue: 404 Error on Page Refresh

When deploying a React Single Page Application (SPA), refreshing the page on any route other than the root (/) results in a 404 error. This happens because the server tries to find a file that doesn't exist - React Router handles routing on the client side.

## Solutions by Platform

### Netlify
The following files are already included:
- `public/_redirects` - Redirects all routes to index.html
- `public/netlify.toml` - Alternative configuration method

No additional configuration needed.

### Vercel
The `vercel.json` file in the root directory handles routing.

### Render
The `render.yaml` file includes rewrite rules for static sites.

### Apache Servers
The `public/.htaccess` file handles URL rewriting for Apache servers.

### Azure Static Web Apps
The `staticwebapp.config.json` file configures routing.

### Nginx
Add this to your nginx configuration:
```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

### AWS S3 + CloudFront
1. In S3, set the error document to `index.html`
2. In CloudFront, create a custom error response:
   - Error Code: 404
   - Response Page Path: /index.html
   - Response Code: 200

### GitHub Pages
GitHub Pages doesn't support true SPA routing. Consider using HashRouter instead of BrowserRouter, or use a service like Netlify.

### Firebase Hosting
Add to `firebase.json`:
```json
{
  "hosting": {
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## Build and Deploy

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. The `dist` folder contains all static files ready for deployment.

3. Deploy the `dist` folder to your hosting service.

## Environment Variables

For production deployments, ensure your backend URL is correctly set in your environment variables or update the API base URL in your service files.