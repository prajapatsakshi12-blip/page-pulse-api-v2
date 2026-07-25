# Architecture Document

## Overview
Page Pulse is a production-ready URL audit API that checks website availability, validates URLs, caches repeated requests, and protects the service using rate limiting.

## Components
* **Client:** Sends URL requests to the API.
* **Express.js API Server:** Handles incoming HTTP routing.
* **URL Validator:** Ensures the URL format is correct.
* **Audit Service:** Performs live HTTP checks on targets.
* **In-Memory Cache:** Temporarily saves successful audit reports.
* **Rate Limiter:** Restricts abusive requests per IP.

## Data Flow
1. Client sends a URL request.
2. API validates the URL format.
3. Cache is checked for an existing result.
4. If found, the cached response is returned immediately.
5. Otherwise, the server audits the target website.
6. The result is stored in the cache.
7. The API returns a structured JSON response.

