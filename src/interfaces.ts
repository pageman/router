import http from "http";

// INTERFACES
export interface RequestObject extends http.IncomingMessage {
  body?: any;
  params?: any;
  query?: any;
}
export interface ResponseObject extends http.ServerResponse {
  send: (args: any) => void;
  setHeader: (args: any) => void;
  json: (json: object) => void;
  html: (html: string) => void;
}

export interface ContextObject {
  req: RequestObject;
  res: ResponseObject;
  body?: any;
  params?: any;
  query?: any;
}

// TYPES

export type MethodFunction = (url: string, fn?: Middleware) => void;
export type NextFunction = (args?: any) => void;
export type Middleware = (obj: ContextObject, next?: NextFunction) => void;
export type RequestMethod = "get" | "post" | "put" | "patch" | "delete" | "options";
export type Route = { [method: string]: Middleware } & { url: string };
export type Routes = Route[];
