const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 3001; // This will be the port for the proxy server

// Add the required headers for SharedArrayBuffer support
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Proxy all requests to the Angular dev server at localhost:4200
app.use(
  '/',
  createProxyMiddleware({
    target: 'http://localhost:6800/',
    changeOrigin: true,
    ws: true
  })
);

// Start the proxy server
app.listen(PORT, () => {
  console.log(`Proxy server is running on http://localhost:${PORT}`);
  console.log(`Forwarding requests to Angular dev server at http://localhost:4200`);
});
