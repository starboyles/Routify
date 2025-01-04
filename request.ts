import { IncomingMessage } from "http";

export class RoutifyRequest {
  public params: Record<string, string> = {};
  public query: Record<string, string> = {};
  public body: any;

  constructor(private req: IncomingMessage, private url: URL) { }

  async parseBody(): Promise<void> {
    if (!this.body) {
      const chunks = [];
      for await (const chunk of this.req) {
        chunks.push(chunk);
      }
      const data = Buffer.concat(chunks).toString();
      try {
        this.body = JSON.parse(data);
      } catch {
        this.body = {};
      }
    }
  }

  getHeader(name: string): string | undefined {
    return this.req.headers[name.toLowerCase()] as string;
  }

  get method(): string {
    return this.req.method || "GET";
  }
}
