import http from "http";

export interface RouterFunctions {
  init: () => void;
  use: (middleware: Middlewares) => MayaRouter;
  add: (path: string, route: MayaJsRoute | MayaJsRoute[]) => void;
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
  middlewares?: Middlewares[];
  callback: MayaJsRouteCallback;
}

export interface MayaJsRoute extends Route {
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
