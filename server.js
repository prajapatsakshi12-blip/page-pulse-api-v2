const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

// Simple In-Memory Cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Simple Rate Limiter State
const ipRequestCounts = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10;

// Helper: Custom Logger
const log = (level, message, context = {}) => {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({ timestamp, level, message, ...context }));
};

// Rate Limiter Middleware
const rateLimiter = (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const now = Date.now();

  if (!ipRequestCounts.has(ip)) {
    ipRequestCounts.set(ip, []);
  }

  const timestamps = ipRequestCounts.get(ip).filter(t => now - t < RATE_LIMIT_WINDOW);
  timestamps.push(now);
  ipRequestCounts.set(ip, timestamps);

  if (timestamps.length > MAX_REQUESTS) {
    log('WARN', 'Rate limit exceeded', { ip });
    return res.status(429).json({ error: 'Too many requests. Please try again later.' });
  }

  next();
};

// Root Endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Page Pulse API. Use POST /api/audit to audit URLs.' });
});

// URL Audit Endpoint
app.post('/api/audit', rateLimiter, async (req, res) => {
  const { url } = req.body;

  if (!url) {
    log('WARN', 'Missing URL in request body');
    return res.status(400).json({ error: 'URL is required in the request body.' });
  }

  // Validate URL format
  try {
    new URL(url);
  } catch (e) {
    log('WARN', 'Invalid URL format provided', { url });
    return res.status(400).json({ error: 'Invalid URL format.' });
  }

  // Check Cache
  const cachedData = cache.get(url);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    log('INFO', 'Serving from cache', { url });
    return res.json({ ...cachedData.data, cached: true });
  }

  log('INFO', 'Auditing URL', { url });
  const startTime = Date.now();

  try {
    const response = await axios.get(url, { timeout: 8000, headers: { 'User-Agent': 'PagePulseAuditAgent/1.0' } });
    const duration = Date.now() - startTime;

    const auditResult = {
      url,
      status: 'UP',
      statusCode: response.status,
      responseTimeMs: duration,
      contentLength: response.headers['content-length'] || 'unknown',
      contentType: response.headers['content-type'] || 'unknown',
      auditedAt: new Date().toISOString()
    };

    // Store in Cache
    cache.set(url, { timestamp: Date.now(), data: auditResult });

    return res.json({ ...auditResult, cached: false });
  } catch (error) {
    const duration = Date.now() - startTime;
    log('ERROR', 'Audit failed', { url, error: error.message });

    const auditResult = {
      url,
      status: 'DOWN',
      error: error.message,
      responseTimeMs: duration,
      auditedAt: new Date().toISOString()
    };

    return res.status(500).json(auditResult);
  }
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  log('INFO', `Server is running on port ${PORT}`);
});

