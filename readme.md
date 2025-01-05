# Welcome to Routify! 🐎 

A robust, TypeScript-first HTTP router for Node.js with comprehensive middleware support. Routify is built for developers who need a lightweight yet formidable routing solution with `strong type safety`.

## Features

At the moment, Routify has support for these:

* 🎯 Full TypeScript support
* 🔄 Global and route-specific middleware
* ⚡️ Async/await support
* 🎨 Clean, chainable API
* 🔍 URL parameter parsing
* 🔄 Automatic body parsing for `POST`/`PUT`/`PATCH`
* 📦 Zero dependencies
* 🛡️ Built-in error handling


## Installation

⚠️ Routify is still under construction, so no possibility of `npm` installation, at the moment. 

```bash
npm install routify
```
## Quick Start
```typescript
import { Routify } from 'routify';

const app = new Routify(3000); // Port optional, defaults at 3000

// Global middleware example
app.use(async (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.pathname}`);
  await next();
});

// Routes with middleware
app.get('/api/testingroutify', async (req, res) => {
  res.json({ message: 'Testing Routify!' });
});

app.get('/api/users/:id', 
  // Route-specific middleware
  async (req, res, next) => {
    const token = req.getHeader('Authorization');
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    await next();
  },
  async (req, res) => {
    const { id } = req.params;
    res.json({ userId: id });
  }
);

app.start(() => {
  console.log('🐎 Routify is running on port 3000');
});
```

## API Reference
### Creating a Router:

```typescript
import { Routify } from 'routify';
const app = new Routify();
```
### Middleware Support

```typescript
// Global middleware
app.use(async (req, res, next) => {
  // Middleware logic
  await next();
});

// Route-specific middleware
app.get('/path', 
  middleware1,
  middleware2,
  handler
);
```

### Route Methods
```typescript
app.get(path: string, ...handlers: (RouteHandler | Middleware)[]);
app.post(path: string, ...handlers: (RouteHandler | Middleware)[]);
app.put(path: string, ...handlers: (RouteHandler | Middleware)[]);
app.delete(path: string, ...handlers: (RouteHandler | Middleware)[]);
```
### Request Object
```typescript
interface RoutifyRequest {
  params: Record<string, string>;    // URL parameters
  query: Record<string, string>;     // Query string parameters
  body: any;                         // Parsed request body
  parseBody(): Promise<void>;        // Parse request body
  getHeader(name: string): string | undefined;
  method: string;
  pathname: string;
}
```

### Response Object
```typescript
interface RoutifyResponse {
  status(code: number): RoutifyResponse;
  json(data: any): void;
  send(data: string): void;
  setHeader(name: string, value: string): RoutifyResponse;
}
```

### URL Parameters

Support for URL parameters using `:param` syntax:
```typescript
app.get('/api/users/:id', async (req, res) => {
  const { id } = req.params;
  res.json({ userId: id });
});
```

### Query Parameters

Query parameters are automatically parsed and accessible via `req.query`:
```typescript
// GET /api/search?q=test&sort=desc
app.get('/api/search', async (req, res) => {
  const { q, sort } = req.query;
  res.json({ searchTerm: q, sortOrder: sort });
});
```

### Body Parsing
Automatic body parsing for POST/PUT/PATCH requests:

```typescript
app.post('/api/users', async (req, res) => {
  await req.parseBody();
  const userData = req.body;
  res.status(201).json({ 
    message: 'User created', 
    user: userData 
  });
});
```

### Error Handling
Comprehensive error handling for both middlewares and routes:
```typescript
// Global error handling middleware
app.use(async (req, res, next) => {
  try {
    await next();
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
```

### Examples
Basic `REST API` With Auth:
```typescript
const authMiddleware = async (req, res, next) => {
  const token = req.getHeader('Authorization');
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  await next();
};

app
  .get('/api/testingroutify', async (req, res) => {
    res.json({ message: 'Testing Routify!' });
  })
  .get('/api/users/:id', 
    authMiddleware,
    async (req, res) => {
      const { id } = req.params;
      res.json({ userId: id, data: 'User data here' });
    }
  )
  .post('/api/users', async (req, res) => {
    await req.parseBody();
    res.status(201).json({ 
      message: 'User created', 
      user: req.body 
    });
  });
```
---
**Contributions?** Please feel free to submit a Pull Request. Check out our contributing guidelines for more information.

---
**Happy Routing With Routify! 🐎**