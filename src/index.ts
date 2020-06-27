import { Routes, RequestMethod, Middleware, ContextObject, ResponseObject, RequestObject, RequestObjectProps } from "./interfaces";
import ResponseFunctions from "./response_functions";
import methods from "./methods";
import Url from "./url";
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
  url: Url;

  constructor(private routes: Routes = []) {
    this.url = new Url();
  }

  get init() {
    return (req: http.IncomingMessage, res: http.ServerResponse) => {
      const { index, found, params, key } = this.url.find(this.routes, req.url ?? "");

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
    this.routes[index][url][method](context);
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
