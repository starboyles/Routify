import http from "http";
import { URL } from "url";
import {
  HttpMethod,
  Route,
  RouteHandler,
  Middleware,
  NextFunction,
} from "./types";
import { RoutifyRequest } from "./request";
import { RoutifyResponse } from "./response";

export class Routify {
  private routes: Route[] = [];
  private globalMiddlewares: Middleware[] = [];
  private server: http.Server;
  private port: number;

  constructor(port: number = 3000) {
    this.port = port;
    this.server = http.createServer(this.handleRequest.bind(this));
  }

  use(middleware: Middleware): Routify {
    this.globalMiddlewares.push(middleware);
    return this;
  }

  private addRoute(
    method: HttpMethod,
    path: string,
    handler: RouteHandler,
    middlewares: Middleware[]
  ): Routify {
    this.routes.push({ method, path, handler, middlewares });
    return this;
  }

  get(path: string, ...handlers: (RouteHandler | Middleware)[]): Routify {
    const middleware = handlers.slice(0, -1) as Middleware[];
    const handler = handlers[handlers.length - 1] as RouteHandler;
    return this.addRoute("GET", path, handler, middleware);
  }

  post(path: string, ...handlers: (RouteHandler | Middleware)[]): Routify {
    const middleware = handlers.slice(0, -1) as Middleware[];
    const handler = handlers[handlers.length - 1] as RouteHandler;
    return this.addRoute("POST", path, handler, middleware);
  }

  put(path: string, ...handlers: (RouteHandler | Middleware)[]): Routify {
    const middleware = handlers.slice(0, -1) as Middleware[];
    const handler = handlers[handlers.length - 1] as RouteHandler;
    return this.addRoute("PUT", path, handler, middleware);
  }

  delete(path: string, ...handlers: (RouteHandler | Middleware)[]): Routify {
    const middleware = handlers.slice(0, -1) as Middleware[];
    const handler = handlers[handlers.length - 1] as RouteHandler;
    return this.addRoute("DELETE", path, handler, middleware);
  }

  //extract query params
  private extractParams(
    routePath: string,
    requestPath: string
  ): Record<string, string> | null {
    const routeParts = routePath.split("/");
    const requestParts = requestPath.split("/");

    if (routeParts.length !== requestParts.length) {
      return null;
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(":")) {
        const paramName = routeParts[i].slice(1);
        params[paramName] = requestParts[i];
      } else if (routeParts[i] !== requestParts[i]) {
        return null;
      }
    }
    return params;
  }

  private async executeMiddlewareChain(
    middlewares: Middleware[],
    req: RoutifyRequest,
    res: RoutifyResponse
  ): Promise<boolean> {
    let currentMiddlewareIndex = 0;

    const next: NextFunction = async () => {
      currentMiddlewareIndex++;
      if (currentMiddlewareIndex < middlewares.length) {
        await middlewares[currentMiddlewareIndex](req, res, next);
      }
    };

    try {
      if (middlewares.length > 0) {
        await middlewares[0](req, res, next);
      }
      return true;
    } catch (error) {
      console.error("Middleware error:", error);
      return false;
    }
  }

  private async handleRequest(
    nodeReq: http.IncomingMessage,
    nodeRes: http.ServerResponse
  ) {
    const method = nodeReq.method as HttpMethod;
    const url = new URL(nodeReq.url || "", `http://${nodeReq.headers.host}`);

    const req = new RoutifyRequest(nodeReq, url);
    const res = new RoutifyResponse(nodeRes);

    try {
      const globalMiddlewareSuccess = await this.executeMiddlewareChain(
        this.globalMiddlewares,
        req,
        res
      );

      if (!globalMiddlewareSuccess) {
        res.status(500).json({ error: "Middleware Error" });
        return;
      }

      //Find the matching route
      for (const route of this.routes) {
        if (route.method === method) {
          const params = this.extractParams(route.path, url.pathname);
          if (params) {
            req.params = params;
            req.query = Object.fromEntries(url.searchParams);

            // Execute route-specific middlewares
            const routeMiddlewareSuccess = await this.executeMiddlewareChain(
              route.middlewares,
              req,
              res
            );

            if (!routeMiddlewareSuccess) {
              res.status(500).json({ error: "Route Middleware Error" });
              return;
            }

            // Parse body for POST/PUT/PATCH requests
            if (["POST", "PUT", "PATCH"].includes(method)) {
              await req.parseBody();
            }

            // Execute route handler
            await route.handler(req, res);
            return;
          }
        }
      }

      // No route matched
      res.status(404).json({ error: "Not Found" });
    } catch (error) {
      console.error("Request handler error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  start(callback?: () => void): void {
    this.server.listen(this.port, () => {
      console.log(`🚀 Routify is running on port ${this.port}`);
      callback?.();
    });
  }
}
