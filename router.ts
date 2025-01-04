import http from 'http';
import { URL } from 'url'; 
import { HttpMethod, Route, RouteHandler, Middleware, NextFunction} from './types';
import { RoutifyRequest } from './request';
import { RoutifyResponse } from './response';

export class Routify {
    private routes: Route[] = [];
    private globalMiddlewares: Middleware[] = [];
    private server: http.Server; 
    private port: number;
    
    constructor(port: number = 3000) {
      this.port = port;
        this.server = http.createServer(this.handleRequest.bind(this));
      }

      use(middleware: Middleware): Routify{
       this.globalMiddlewares.push(middleware); 
       return this;
      }

    private addRoute(method: HttpMethod, path: string, handler: RouteHandler, middlewares: Middleware[] ): Routify {
      this.routes.push({ method, path, handler, middlewares });
    return this;
    }
    
    get(path: string, ...handlers: (RouteHandler | Middleware) []): Routify{
      const middleware = handlers.slice(0, -1) as Middleware[];
      const handler = handlers[handlers.length - 1] as RouteHandler;
    return this.addRoute('GET', path, handler, middleware);
    }

    post(path: string, ...handlers: (RouteHandler | Middleware) []): Routify{
      const middleware = handlers.slice(0, -1) as Middleware[];
      const handler = handlers[handlers.length - 1] as RouteHandler;
    return this.addRoute('POST', path, handler, middleware);
    }

    put(path: string, ...handlers: (RouteHandler | Middleware) []): Routify{
      const middleware = handlers.slice(0, -1) as Middleware[];
      const handler = handlers[handlers.length - 1] as RouteHandler;
    return this.addRoute('PUT', path, handler, middleware);
    }

    delete(path: string, ...handlers: (RouteHandler | Middleware) []): Routify{
      const middleware = handlers.slice(0, -1) as Middleware[];
      const handler = handlers[handlers.length - 1] as RouteHandler;
    return this.addRoute('DELETE', path, handler, middleware);
    }

    



    private async handleRequest(nodeReq: http.IncomingMessage, nodeRes: http.ServerResponse){
      const method = nodeReq.method as HttpMethod;
      const url = new URL(nodeReq.url ||'', `http://${nodeReq.headers.host}`);

      const req = new RoutifyRequest(nodeReq, url);
      const res = new RoutifyResponse(nodeRes);

      try {
        const globalMiddlewareSuccess = await this.executeMiddlewareChain(
        this.globalMiddlewares,
        req,
        res
      );

      if (!globalMiddlewareSuccess) {
        res.status(500).json({ error: 'Middleware Error' });
        return;
      }

      } catch (error) {
        console.error('Request handler error:', error);
      }
    }
}