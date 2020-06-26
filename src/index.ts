import { Routes, RequestMethod, Middleware, ContextObject } from "./interfaces";
import methods from "./methods";
import http from "http";

interface Router {
  get(path: string, fn: Middleware): void;
  post(path: string, fn: Middleware): void;
  put(path: string, fn: Middleware): void;
  patch(path: string, fn: Middleware): void;
  delete(path: string, fn: Middleware): void;
  options(path: string, fn: Middleware): void;
}

class Router {
  constructor(private routes: Routes = []) {}

  get init() {
    return (req: http.IncomingMessage, res: http.ServerResponse) => {
      const url = this.removePrefix(req.url ?? "");
      const { index, found } = this.findUrl(url);

      if (!found) {
        throw new Error("Request path doesn't exist!");
      }

      const context = this.createContextObject(req, res);
      this.requestHandler(index, req.method?.toLocaleLowerCase() as RequestMethod, url, context);
    };
  }

  add(method: RequestMethod, url: string, fn: Middleware): Router {
    const requestPath = this.removePrefix(url ?? "");
    const { index, found } = this.findUrl(requestPath);

    if (index >= 0 && found) {
      // Add method to existing object in routes array
      this.routes[index][url] = { [method]: fn };
      return this;
    }

    // Add method new object in routes array
    this.routes.push({ [url]: { [method]: fn } });

    return this;
  }

  private requestHandler(index: number, method: RequestMethod, url: string, context: ContextObject): void {
    this.routes[index][url][method](context);
  }

  private findUrl(url: string = ""): { index: number; found: boolean } {
    let index: number = -1;

    // Find the key for the route if existed
    const found = this.routes.some((item: any, idx: number): boolean => {
      index = idx;
      return Boolean(item[url]);
    });

    return { index, found };
  }

  private createResponseObject(res: http.ServerResponse) {
    const resFunctions = {
      send: (value: any) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(value));
        res.end();
      },
      setHeader: () => {},
      json: () => {},
      html: () => {},
    };
    return Object.assign(res, resFunctions);
  }

  private removePrefix(url: string) {
    return url.substring(1);
  }

  private createContextObject(req: http.IncomingMessage, res: http.ServerResponse) {
    return {
      req,
      res: this.createResponseObject(res),
      body: {},
      params: {},
      query: {},
    };
  }
}

// Add all the HTTP Methods as a function to Router
methods.forEach((method: RequestMethod) => {
  Router.prototype[method] = function (url: string, fn: Middleware) {
    return this.add(method, url, fn);
  };
});

export = Router;
