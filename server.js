// server.js
const express = require('express');
const path = require('path');
const app = express();

// Set headers to provoke CSP/Referrer/Other checks failures
app.use((req, res, next) => {
  // Very restrictive CSP that blocks inline scripts/styles and external resources
  res.setHeader('Content-Security-Policy',
    "default-src 'none'; script-src 'self'; connect-src 'self'; img-src 'self'; style-src 'self'");
  // Restrictive referrer policy
  res.setHeader('Referrer-Policy', 'no-referrer');
  // No referrer or cross-origin allowances
  res.setHeader('X-Content-Type-Options', 'nosniff');
  // intentionally not setting Secure or SameSite cookies (simulate cookie issues)
  next();
});

// Serve static files (index_fail_all.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index_fail_all.html'));
});

// Slow resource: delay the response to provoke timeout issues
app.get('/slow.js', (req, res) => {
  // Delay long enough to provoke a timeout in some auditing systems
  const delayMs = 20000; // 20s delay
  setTimeout(() => {
    res.type('application/javascript');
    res.send('console.log("slow.js loaded after delay");');
  }, delayMs);
});

// Nonexistent external resource simulation: proxy a 404 endpoint
app.get('/force-404.js', (req, res) => {
  res.status(404).send('/* not found */');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Failure test server running at http://localhost:${PORT}`);
});
