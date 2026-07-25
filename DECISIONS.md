# Architectural Decisions

1. **Framework:** Node.js with Express for minimal and fast API routing.
2. **Caching:** In-memory `Map` data structure implemented for caching URL responses for 5 minutes to reduce server load.
3. **Rate Limiting:** IP-based custom sliding window middleware implemented to allow maximum 10 requests per minute per IP.
