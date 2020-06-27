import { Routes, RequestMethod, Middleware, ContextObject, ResponseObject, RequestObject, RequestObjectProps } from "./interfaces";
import ResponseFunctions from "./response_functions";
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
      const { index, found, params, key } = this.findUrl(req.url ?? "");

      if (!found) {
        throw new Error("Request path doesn't exist!");
      }

      const reqProps = this.createRequestObjectProps(params, {}, {});
      const context = this.createContextObject(this.createRequestObject(req, reqProps), this.createResponseObject(res));

      this.requestHandler(index, req.method?.toLocaleLowerCase() as RequestMethod, key, context);
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

  private findUrl(url: string = ""): { index: number; found: boolean; params: RegExpExecArray | null; key: string } {
    let index: number = -1;
    let key = url;
    let params = null;

    // Find the key for the route if existed
    const found = this.routes.some((route: any, idx: number): boolean => {
      const routeKey = Object.keys(route)[0];

      // Generate regex based on the current route
      const regex = this.urlToRegex(routeKey);

      // Check if route has request params
      const hasParams = regex.test(url);

      if (hasParams) {
        // Set key to current route key
        key = routeKey;

        // Retrieve params if there are any
        params = regex.exec(url);
      }

      index = idx;
      return Boolean(route[url]) || hasParams;
    });

    return { index, found, params, key };
  }

  private createResponseObject(res: http.ServerResponse): ResponseObject {
    return Object.assign(res, ResponseFunctions(res));
  }

  private createRequestObject(req: http.IncomingMessage, props: RequestObjectProps): RequestObject {
    return Object.assign(req, props);
  }

  private createRequestObjectProps(params: RegExpExecArray | null, body: any, query: any): RequestObjectProps {
    return { params: params?.groups, body, query };
  }

  private urlToRegex(url: string) {
    const base = (val: string) => new RegExp(`^${val}$`);
    const notParam = (val: string) => `(?:\\/(${val}))`;
    const isParam = (val: string) => `(?:\\/(?<${val}>[\\w\\-]+?))`;
    const regex = url
      .split("/")
      .map((val) => (val.includes(":") ? isParam(val.substring(1)) : notParam(val)))
      .join("");

    return base(regex);
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
