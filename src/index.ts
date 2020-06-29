import response from "./response";
import RequestHelper from "./request";
import bodyParser from "./body_parser";
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

class Router {
  private url: Url;
  private request: RequestHelper;
  private middlewares: (Router.MayaJSMiddleware | Router.ExpressMiddleware)[];

  constructor(private routes: Router.Routes = []) {
    this.url = new Url();
    this.request = new RequestHelper();
    this.middlewares = [];
  }

  /**
   * Emit a function correspond with current incoming request after all the middlewares are
   * finished executing.
   *
   * @return A function that can be consume by http.createServer
   */
  get init() {
    return (req: http.IncomingMessage, res: http.ServerResponse) => {
      const query = req.url ? this.url.queryString(req) : "";
      const { index, found, params, key } = this.url.find(this.routes, req.url?.replace(query, "") ?? "");

      if (!found) {
        throw new Error("Request path doesn't exist!");
      }

      this.middlewares.push(this.finalize({ index, query, params, key }));

      invoker(req, res, [bodyParser, ...this.middlewares]);
    };
  }

  /**
   * Adds a route in the list
   *
   * @param method A type of http method in lower case
   * @param url A url string
   * @param fn A function that will be call when this route is executed
   * @return Router instance
   */
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
   * @return Router instance
   */
  use(middleware: Router.MayaJSMiddleware | Router.ExpressMiddleware | (Router.MayaJSMiddleware | Router.ExpressMiddleware)[]): this {
    if (Array.isArray(middleware)) {
      this.middlewares.push(...middleware);
      return this;
    }

    this.middlewares.push(middleware);

    return this;
  }

  /**
   * Handle GET request
   *
   * @param path Request path
   * @param method A callback function
   * @return Router instance
   */
  get(path: string, fn: Router.CallbackFunction): Router {
    return this.add("get", path, fn);
  }

  /**
   * Handle GET request
   *
   * @param path Request path
   * @param method A callback function
   * @return Router instance
   */
  post(path: string, fn: Router.CallbackFunction): Router {
    return this.add("post", path, fn);
  }

  /**
   * Handle PUT request
   *
   * @param path Request path
   * @param method A callback function
   * @return Router instance
   */
  put(path: string, fn: Router.CallbackFunction): Router {
    return this.add("put", path, fn);
  }

  /**
   * Handle PATCH request
   *
   * @param path Request path
   * @param method A callback function
   * @return Router instance
   */
  patch(path: string, fn: Router.CallbackFunction): Router {
    return this.add("patch", path, fn);
  }

  /**
   * Handle DELETE request
   *
   * @param path Request path
   * @param method A callback function
   * @return Router instance
   */
  delete(path: string, fn: Router.CallbackFunction): Router {
    return this.add("delete", path, fn);
  }

  /**
   * Handle OPTIONS request
   *
   * @param path Request path
   * @param method A callback function
   * @return Router instance
   */
  options(path: string, fn: Router.CallbackFunction): Router {
    return this.add("options", path, fn);
  }

  private finalize({ index, query, params, key }: { index: number; query: string; params: RegExpExecArray | null; key: string }) {
    return ({ req, res, error: body }: Router.MiddlewareParams) => {
      const reqProps = this.request.props(params, body, query);
      const context = this.createContextObject(this.request.obj(req, reqProps), response(res));
      const method = req.method?.toLocaleLowerCase() as Router.RequestMethod;
      this.requestHandler(index, method, key, context);
    };
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

export = Router;
