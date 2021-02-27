import http from "http";

export interface RouterFunctions {
  init: () => void;
  /**
   * A function that accept a middleware.
   *
   *   MayaJS Middleware
   * ```
   * const middleware = (options, next) => {
   *   // Do something here
   *   next();
   * };
   * ```
   * Other Middlewares i.e. Express
   * ```
   * const middleware = (req, res, next) => {
   *   // Do something here
   *   next();
   * };
   *
   * app.use(middleware);
   *
   * // Calling a middleware factory
   * app.use(middleware());
   *
   * // Using 'body-parser' as middleware
   * app.use(bodyParser.json());
   * ```
   * @param middleware Middlewares are functions that can be executed before calling the main route.
   */
  use: (middleware: Middlewares) => MayaRouter;
  /**
   * A function that adds the path for a route and reference the routes define to MayaJs route list.
   * This routes callback function will be executed everytime an incoming request has the same path or match its regex pattern.
   *
   * ```
   * app.add("path-name", [
   * {
   *   method: "GET",
   *   middlewares: [],
   *   callback: ({ req, body, params, query }) => {
   *      return "Hello, World"; // A value that the client will recieve
   *    },
   *  },
   * ]);
   * ```
   *
   * @param path A name or a regex pattern for a route endpoint
   * @param routes A list of route objects
   */
  add: (path: string, routes: MayaJsRoute | MayaJsRoute[]) => void;
}

export type MayaJsRouter = ((req: any, res: any) => void) & RouterFunctions;

interface RouterHelperMethod extends RouterFunctions {
  addRouteToList: (path: string, route: MayaJsRoute) => void;
  findRoute: (path: string, method: RequestMethods) => MayaJSRouteParams | null;
  executeRoute: (path: string, route: MayaJSRouteParams, context: MayaJsContext) => Promise<any>;
  visitedRoute: (path: string, method: RequestMethods) => VisitedRoutes | null;
}

export interface MayaRouter extends RouterHelperMethod {
  routes: MayaJSRoutes<MayaJSRouteParams>;
  routesWithParams: MayaJSRoutes<MayaJSRouteParams>;
  visitedRoutes: MayaJSRoutes<VisitedRoutes>;
  middlewares: Middlewares[];
}

export interface QueryParams {
  query: { [x: string]: string | string[] };
  params: { [x: string]: string };
  body: any;
}

export interface MiddlewareContext {
  res: MayaJsResponse;
  req: MayaJsRequest;
  error?: any;
}

export interface MayaJsContext extends MiddlewareContext, QueryParams {}

export type MayaJsRouteCallback = (ctx: MayaJsContext) => Promise<any> | any;

export interface Route {
  dependencies?: any[];
  /**
   * An array of MayaJS or other third party middlewares. These middlewares are called before the callback function
   *
   * ```
   * {
   *    middlewares: [middleware1, middleware2],
   * }
   * ```
   */
  middlewares?: Middlewares[];
  /**
   * A function that will be executed once the 'path-name' is the same with the request path
   *
   * ```
   * {
   *   callback: ({ req, body, params, query }) => {
   *       return 'Hello, world'; // You can also return a JSON object
   *   }
   * }
   * ```
   */
  callback: MayaJsRouteCallback;
}

export interface MayaJsRoute extends Route {
  /**
   * The name of the method type of an incoming request.
   * ```
   * {
   *   method: "GET"
   * }
   * ```
   * Method types
   * ```
   * "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
   *```
   */
  method: RequestMethods;
}

export interface MayaJSRouteParams extends MayaJsRoute {
  regex: RegExp;
}

export interface MayaJSRoutes<T> {
  [x: string]: {
    [K in RequestMethods]: T;
  };
}

export interface VisitedRoutes extends MayaJSRouteParams, QueryParams {}

/**
 * A representation of additional methods for response object
 */
export interface ResponseObjectProps {
  send(args: any, statusCode?: number): void;
  json(json: object, statusCode?: number): void;
  html(html: string, statusCode?: number): void;
}

/**
 * An object representing NodeJS Server Response with additonal
 * methods added by the @mayajs/router api
 */
export interface MayaJsResponse extends http.ServerResponse, ResponseObjectProps {}

/**
 * An object representing NodeJS Incoming Message with additonal
 * methods added by the @mayajs/router api
 */
export interface MayaJsRequest extends http.IncomingMessage, QueryParams {
  body: any;
  file: any;
}

/**
 *  Generic methods from Node.js 0.10
 * */
export type RequestMethods = "GET" | "POST" | "PUT" | "HEAD" | "DELETE" | "OPTIONS" | "PATCH";

export type MayaJsNextfunction = (error?: any) => Promise<void> | void;

export type ExpressJsMiddleware = (req: MayaJsRequest, res: MayaJsResponse, next: MayaJsNextfunction, error: any) => void;

export type MayaJsMiddleware = (context: MayaJsContext, next: MayaJsNextfunction) => void;

export type Middlewares = ExpressJsMiddleware | MayaJsMiddleware;
