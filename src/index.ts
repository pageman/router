import { Routes, RequestMethod, Middleware, ContextObject, AdditionalResponseObjectFunctions, ResponseObject } from "./interfaces";
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

  private findUrl(url: string = ""): { index: number; found: boolean; params: any } {
    let index: number = -1;
    let params = {};

    // Find the key for the route if existed
    const found = this.routes.some((item: any, idx: number): boolean => {
      // Retrieve params if there are any
      params = this.checkUrlForParams(idx);
      index = idx;
      return Boolean(item[url]);
    });

    return { index, found, params };
  }

  private createResponseObject(res: http.ServerResponse): ResponseObject {
    const resFunctions: AdditionalResponseObjectFunctions = {
      send: (value: any) => {
        if (value instanceof Object) {
          res.writeHead(200, { "Content-Type": "application/json" });
          value = JSON.stringify(value);
        } else {
          res.writeHead(200, { "Content-Type": "text/plain" });
        }

        res.write(value);
        res.end();
      },
      json: (json: object) => {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.write(JSON.stringify(json));
        res.end();
      },
      html: (html: string) => {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(html);
        res.end();
      },
    };
    return Object.assign(res, resFunctions);
  }

  private checkUrlForParams(index: number) {
    Object.keys(this.routes[index]);
    return {};
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
