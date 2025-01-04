import { IncomingMessage, ServerResponse } from 'http';
import { RoutifyRequest} from './request'
import { RoutifyResponse } from './response'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
export type NextFunction = () => Promise<void>;
export type Middleware = (req: RoutifyRequest, res: RoutifyResponse, next: NextFunction) => Promise<void>;
export type RouteHandler = (req: RoutifyRequest, res: RoutifyResponse) => Promise<void>;

export interface Route {
  method: HttpMethod;
  path: string;
  handler: RouteHandler;
  middlewares: Middleware[];
}
