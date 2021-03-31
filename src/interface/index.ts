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
   * app.add([
   * {
   *   // Route name or path name
   *   path: "path-name",
   *
   *   // Route specific middlewares
   *   middlewares: [],
   *
   *   // A route method definition
   *   GET: ({ req, body, file, params, query }) => {
   *
   *      // Response value
   *      return "Hello, World";
   *   },
   *
   *   // A method object that has callbacka and middlewares
   *   POST: {
   *
   *    // Method specific middlewares
   *    middlewares: [middleware],
   *
   *    // Method callback function
   *    callback: ({ req, body, params, query }) => {
   *      return "Hello, World";
   *    },
   *   },
   * }
   * ]);
   * ```
   *
   * @param routes A list of routes
   */
  add: (routes: MayaJsRoute[]) => void;
}

export type MayaJsRouter = ((req: any, res: any) => void) & RouterFunctions;

interface RouterHelperMethod {
  addRouteToList: (route: MayaJsRoute, parent?: string) => void;
  findRoute: (path: string, method: MethodNames) => MayaJSRouteParams | null;
  executeRoute: (path: string, route: MayaJSRouteParams) => Promise<any>;
  visitedRoute: (path: string, method: MethodNames) => VisitedRoutes | null;
}

export interface RouterProps {
  routes: MayaJSRoutes<MayaJSRouteParams>;
  routesWithParams: MayaJSRoutes<MayaJSRouteParams>;
  visitedRoutes: MayaJSRoutes<VisitedRoutes>;
  middlewares: Middlewares[];
  context: any;
}

export interface RouterMethods extends RouterHelperMethod, RouterProps {}

export interface MayaRouter extends RouterMethods, RouterFunctions {}

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

export type RouteCallback = (ctx: MayaJsContext) => Promise<any> | any;

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
}

export interface Type<T> extends Function {
  new (...args: any[]): T;
}

export type ControllerMiddleware = {
  [key in MethodNames]: Middlewares[];
};

/**
 * An abstract class that define all the methods for a single route
 */
export abstract class Controller {
  middlewares: Partial<ControllerMiddleware> = {};
  GET(ctx: MayaJsContext): Promise<any> | any {}
  POST(ctx: MayaJsContext): Promise<any> | any {}
  DELETE(ctx: MayaJsContext): Promise<any> | any {}
  PUT(ctx: MayaJsContext): Promise<any> | any {}
  PATCH(ctx: MayaJsContext): Promise<any> | any {}
  OPTIONS(ctx: MayaJsContext): Promise<any> | any {}
  HEAD(ctx: MayaJsContext): Promise<any> | any {}
}

type ModuleProviders = Type<any>[];
export type ModuleWithProviders = { module: Type<CustomModule>; providers: ModuleProviders };
export type ModuleImports = Type<CustomModule> | ModuleWithProviders;

export abstract class CustomModule {
  declarations: Type<Controller>[] = [];
  imports: ModuleImports[] = [];
  exports: (Type<CustomModule> | Type<CustomModule>)[] = [];
  providers: ModuleProviders = [];
  invoke() {}
  static forRoot(...args: any): ModuleWithProviders {
    return { module: class extends CustomModule {}, providers: [] };
  }
}

export interface MayaJsRoute extends Route, Partial<RouteMethodCallbacks> {
  /**
   * A path for a route endpoint
   *
   * ```
   * {
   *    path: "users"
   * }
   * ```
   */
  path: string;
  /**
   * A class for define a route controller
   */
  controller?: Type<Controller>;
  /**
   * A list of child routes that inherit the path of its parent
   */
  children?: MayaJsRoute[];
  /**
   * Lazy load a module
   */
  loadChildren?: () => Promise<Type<CustomModule>>;
}

export interface MayaJSRouteParams extends Route {
  regex: RegExp;
  callback: RouteCallback;
  method: MethodNames;
}

export interface MayaJSRoutes<T> {
  [x: string]: {
    [K in MethodNames]: T;
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
export type MethodNames = "GET" | "POST" | "PUT" | "HEAD" | "DELETE" | "OPTIONS" | "PATCH";

/**
 *  A record of method name and its callback functions
 * */
export type RouteMethodCallbacks = {
  /**
   * A function that will be executed once the 'path-name' is the same with the request path
   *
   * ```
   * {
   *   GET: ({ req, body, params, query }) => {
   *       return 'Hello, world'; // You can also return a JSON object
   *   }
   * }
   * ```
   */
  [P in MethodNames]: RouteCallback | RouteMethod;
};

export type RouteMethod = {
  middlewares?: Middlewares[];
  callback: RouteCallback;
};

export type MayaJsNextfunction = (error?: any) => Promise<void> | void;

export type ExpressJsMiddleware = (req: MayaJsRequest, res: MayaJsResponse, next: MayaJsNextfunction, error: any) => void;

export type MayaJsMiddleware = (context: MayaJsContext, next: MayaJsNextfunction) => void;

export type Middlewares = ExpressJsMiddleware | MayaJsMiddleware;

export type RouterFunction = RouterProps & RouterMethods;

export type RouterMapper = (parent?: string) => (route: MayaJsRoute) => void;

export type RouterMapperFactory = (router: RouterFunction, app: MayaJsRouter) => RouterMapper;
