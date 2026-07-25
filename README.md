# Page Pulse API

Page Pulse is a production-ready URL audit API that checks website availability, validates URLs, caches repeated requests, and protects the service using rate limiting.

### Project Links
* **GitHub Repository:** https://github.com
* **Live Deployed Link:** https://onrender.com

### API Contract
* **GET /** - Welcome message and health check.
* **POST /api/audit** - Audit a specific URL.
  * Request Body: `{"url": "https://example.com"}`
