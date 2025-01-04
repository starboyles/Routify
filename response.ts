import { ServerResponse } from "http";

export class RoutifyResponse {
  private sent = false;

  constructor(private res: ServerResponse) {}

  status(code: number): RoutifyResponse {
    this.res.statusCode = code;
    return this;
  }

  json(data: any): void {
    if (this.sent) return;
    this.sent = true;
    this.res.setHeader("Content-Type", "application/json");
    this.res.end(JSON.stringify(data));
  }

  send(data: string): void {
    if (this.sent) return;
    this.sent = true;
    this.res.setHeader("Content-Type", "text/plain");
    this.res.end(data);
  }

  setHeader(name: string, value: string): RoutifyResponse {
    this.res.setHeader(name, value);
    return this;
  }
}
