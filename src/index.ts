import { Routes, RequestMethod, Middleware, MethodFunction } from "./interfaces";
import methods from "./methods";
import http from "http";

interface Router {
  get: MethodFunction;
  post: MethodFunction;
  put: MethodFunction;
  patch: MethodFunction;
  delete: MethodFunction;
  options: MethodFunction;
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

      this.routes[index][url][req.method?.toLocaleLowerCase() as RequestMethod]({
        req,
        res: this.createResponseObject(res),
        body: {},
      });
    };
  }

  add(method: RequestMethod, url: string, fn: Middleware) {
    let urlIndex: number = -1;

    // Add the function and the path as the key on the routes object
    const urlFound = this.routes.some((item: any, index: number): boolean => {
      urlIndex = index;
      return Boolean(item[url]);
    });

    if (urlIndex >= 0 && urlFound) {
      // add method to existing object in routes array
      this.routes[urlIndex][url] = { [method]: fn };
      return;
    }

    // add method new object in routes array
    this.routes.push({ [url]: { [method]: fn } });
  }

  requestHandler(options: { method: RequestMethod; url: string; fn?: Middleware }): void {
    console.log(options);
  }

  private findUrl(url: string = ""): { index: number; found: boolean } {
    let index: number = -1;

    // Add the function and the path as the key on the routes object
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

  removePrefix(url: string) {
    return url.substring(1);
  }
}

methods.forEach((method: RequestMethod) => {
  Router.prototype[method] = function (url: string, fn: Middleware) {
    return this.add(method, url, fn);
  };
});

export = Router;
