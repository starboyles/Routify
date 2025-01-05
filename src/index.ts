import { Routify } from './router';
import { RoutifyRequest } from "./request";
import { RoutifyResponse } from "./response";
import { Middleware } from './types';

const app = new Routify(3000);

// 1. Add a logging middleware (runs on all routes)
app.use(async (req: RoutifyRequest, res: RoutifyResponse, next:()=> Promise<void>) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.pathname}`);
  await next();
});

// 2. Add auth middleware (we'll use for specific routes)
const authMiddleware = async (req: RoutifyRequest, res: RoutifyResponse, next: ()=> Promise<void>) => {
  const token = req.getHeader('Authorization');
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  await next();
};

// 3. Test Routes

// Basic GET route
app.get('/api/testingroutify', async (req: RoutifyRequest, res: RoutifyResponse) => {
  res.json({ message: 'Testing Routify!' });
});

// Route with URL parameters
app.get('/api/users/:id', 
  authMiddleware,  // Protected route
  async (req: RoutifyRequest, res: RoutifyResponse) => {
    const { id } = req.params;
    res.json({ userId: id, data: 'User data here' });
  }
);

app.get('/api/search', async (req: RoutifyRequest, res: RoutifyResponse) => {
  const { q, sort } = req.query;
  res.json({ 
    message: 'Search results',
    searchTerm: q,
    sortOrder: sort
  });
});

// POST route with body parsing
app.post('/api/users', async (req: RoutifyRequest, res: RoutifyResponse,) => {
  await req.parseBody();
  const userData = req.body;
  res.status(201).json({ 
    message: 'User created', 
    user: userData 
  });
});

// Start the server
app.start(() => {
  console.log('\nTest the API with these commands:\n');
  console.log('1. Basic GET request:');
  console.log('curl http://localhost:3000/api/testingroutify');
  
  console.log('\n2. GET request with params (will fail without auth):');
  console.log('curl http://localhost:3000/api/users/123');

  console.log('\n3. Test query parameters:');
  console.log('curl "http://localhost:3000/api/search?q=typescript&sort=desc"');
  
  console.log('\n4. GET request with auth:');
  console.log('curl -H "Authorization: Bearer token" http://localhost:3000/api/users/123');
  
  console.log('\n5. POST request with body:');
  console.log('curl -X POST -H "Content-Type: application/json" -d "{\"name\":\"Les\"}" http://localhost:3000/api/users');
});