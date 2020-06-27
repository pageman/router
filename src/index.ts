import { Routes, RequestMethod, Middleware, ContextObject, ResponseObject, RequestObject } from "./interfaces";
import response from "./response";
import RequestHelper from "./request";
import bodyParser from "./body_parser";
import methods from "./methods";
import Url from "./url";
import http from "http";

interface Router {
  get(path: string, fn: Middleware): Router;
  post(path: string, fn: Middleware): Router;
  put(path: string, fn: Middleware): Router;
  patch(path: string, fn: Middleware): Router;
  delete(path: string, fn: Middleware): Router;
  options(path: string, fn: Middleware): Router;
}

class Router {
  url: Url;
  request: RequestHelper;

  constructor(private routes: Routes = []) {
    this.url = new Url();
    this.request = new RequestHelper();
  }

  get init() {
    return (req: http.IncomingMessage, res: http.ServerResponse) => {
      const query = req.url ? this.url.queryString(req) : "";
      const { index, found, params, key } = this.url.find(this.routes, req.url?.replace(query, "") ?? "");

      if (!found) {
        throw new Error("Request path doesn't exist!");
      }

      bodyParser(req, (body: any) => {
        const reqProps = this.request.props(params, body, query);
        const context = this.createContextObject(this.request.obj(req, reqProps), response(res));
        const method = req.method?.toLocaleLowerCase() as RequestMethod;

        this.requestHandler(index, method, key, context);
      });
    };
  }

  add(method: RequestMethod, url: string, fn: Middleware): Router {
    const requestPath = this.removePrefix(url ?? "");
    const { index, found } = this.url.find(this.routes, requestPath);

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
    const routeMethodKeys = Object.keys(this.routes[index][url]);
    const hasMethod = routeMethodKeys.includes(method);

    if (!hasMethod) {
      throw new Error(`Request ${method.toLocaleUpperCase()} method on path '/${url}' not found!`);
    }

    this.routes[index][url][method](context);
  }

  private removePrefix(url: string) {
    return url.substring(1);
  }

  private createContextObject(req: RequestObject, res: ResponseObject) {
    return { req, res, params: req.params, body: req.body, query: req.query };
  }
}

// Add all the HTTP Methods as a function to Router
methods.forEach((method: RequestMethod) => {
  Router.prototype[method] = function (url: string, fn: Middleware) {
    return this.add(method, url, fn);
  };
});

export = Router;
