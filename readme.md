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

Routify is still under construction, so no possibility of `npm` installation, at the moment. ⚠️

```bash
npm install routify
```
## Quick Start
```javascript
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
### Creating a Router

```javascript
import { Routify } from 'routify';
const app = new Routify();
```
## Middleware Support

```javascript
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