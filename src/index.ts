import response from "./response";
import RequestHelper from "./request";
import bodyParser from "./body_parser";
import methods from "./methods";
import invoker from "./middleware";
import Url from "./url";
import http from "http";

namespace Router {
  /**
   * A representation of additional methods for request object
   */
  export interface RequestObjectProps {
    body?: any;
    params?: { [key: string]: string };
    query?: { [key: string]: string };
  }

  /**
   * A representation of additional methods for response object
   */
  export interface ResponseObjectProps {
    send(args: any): void;
    json(json: object): void;
    html(html: string): void;
  }

  /**
   * An object representing NodeJS Server Response with additonal
   * methods added by the @mayajs/router api
   */
  export interface ResponseObject extends http.ServerResponse, ResponseObjectProps {}

  /**
   * An object representing NodeJS Incoming Message with additonal
   * methods added by the @mayajs/router api
   */
  export interface RequestObject extends http.IncomingMessage, RequestObjectProps {}

  /**
   * A MayaJS object containing a request and response object.
   * Also contains optional variables that are extracted in request and response object.
   */
  export interface MayaJSContext {
    req: RequestObject;
    res: ResponseObject;
    body?: any;
    params?: any;
    query?: any;
  }

  /**
   * A function invoking the next middleware
   */
  export type NextFunction = (args?: any) => void;

  /**
   * A function that accepts a 'context' object that contains all the request information
   * and 'next' function that will execute the next middleware on the list
   */
  export type CallbackFunction = (obj: MayaJSContext, next?: NextFunction) => void;

  /**
   * A object params that handles request, response and error
   */
  export type MiddlewareParams = { req: http.IncomingMessage; res: http.ServerResponse; error?: any };

  /**
   * A function that acts as middle man to any route or another middleware function.
   * This function will run before any route will be initialized and call the next middleware if there is any.
   */
  export type MayaJSMiddleware = (obj: MiddlewareParams, next: NextFunction) => void;

  /**
   * A representation of ExpressJS middleware function.
   */
  export type ExpressMiddleware = (req: http.IncomingMessage, res: http.ServerResponse, next: NextFunction, error: any) => void;

  /**
   * A list of http method in lower case
   */
  export type RequestMethod = "get" | "post" | "put" | "patch" | "delete" | "options";

  /**
   * An object to represent a route method function
   */
  export type RequestMethodFunction = { [method: string]: CallbackFunction };

  /**
   * A MayaJS route object
   */
  export type Route = { [url: string]: RequestMethodFunction };

  /**
   * A list of MayaJS Route
   */
  export type Routes = Route[];
}

interface Router {
  get(path: string, fn: Router.CallbackFunction): Router;
  post(path: string, fn: Router.CallbackFunction): Router;
  put(path: string, fn: Router.CallbackFunction): Router;
  patch(path: string, fn: Router.CallbackFunction): Router;
  delete(path: string, fn: Router.CallbackFunction): Router;
  options(path: string, fn: Router.CallbackFunction): Router;
}

class Router {
  private url: Url;
  private request: RequestHelper;
  private middlewares: (Router.MayaJSMiddleware | Router.ExpressMiddleware)[];

  constructor(private routes: Router.Routes = []) {
    this.url = new Url();
    this.request = new RequestHelper();
    this.middlewares = [];
  }

  get init() {
    return (req: http.IncomingMessage, res: http.ServerResponse) => {
      const query = req.url ? this.url.queryString(req) : "";
      const { index, found, params, key } = this.url.find(this.routes, req.url?.replace(query, "") ?? "");

      if (!found) {
        throw new Error("Request path doesn't exist!");
      }

      const executeRoutes: Router.MayaJSMiddleware = ({ req, res }: Router.MiddlewareParams) =>
        bodyParser(req, (body: any) => {
          const reqProps = this.request.props(params, body, query);
          const context = this.createContextObject(this.request.obj(req, reqProps), response(res));
          const method = req.method?.toLocaleLowerCase() as Router.RequestMethod;

          this.requestHandler(index, method, key, context);
        });

      invoker(req, res, [...this.middlewares, executeRoutes]);
    };
  }

  add(method: Router.RequestMethod, url: string, fn: Router.CallbackFunction): Router {
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

  /**
   * Accepts a function as a middleware to be a executed when a request is coming.
   *
   * @param middleware A function that will be execute before the routes
   */
  use(middleware: Router.MayaJSMiddleware | Router.ExpressMiddleware | (Router.MayaJSMiddleware | Router.ExpressMiddleware)[]): this {
    if (Array.isArray(middleware)) {
      this.middlewares.push(...middleware);
      return this;
    }

    this.middlewares.push(middleware);

    return this;
  }

  private requestHandler(index: number, method: Router.RequestMethod, url: string, context: Router.MayaJSContext): void {
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

  private createContextObject(req: Router.RequestObject, res: Router.ResponseObject) {
    return { req, res, params: req.params, body: req.body, query: req.query };
  }
}

// Add all the HTTP Methods as a function to Router
methods.forEach((method: Router.RequestMethod) => {
  Router.prototype[method] = function (url: string, fn: Router.CallbackFunction) {
    return this.add(method, url, fn);
  };
});

export = Router;
