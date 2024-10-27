const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();

// Set the necessary headers
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Serve static files from Angular dist folder
app.use(express.static(path.join(__dirname, 'dist/video-editor')));

// Proxy API requests if needed
app.use(
  '/api',
  createProxyMiddleware({
    target: 'http://localhost:6600',
    changeOrigin: true,
  })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
