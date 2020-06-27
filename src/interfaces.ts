import http from "http";

// INTERFACES

export interface RequestObjectProps {
  body?: any;
  params?: { [key: string]: string };
  query?: { [key: string]: string };
}

export interface AdditionalResponseObjectFunctions {
  send(args: any): void;
  json(json: object): void;
  html(html: string): void;
}

export interface ResponseObject extends http.ServerResponse, AdditionalResponseObjectFunctions {}
export interface RequestObject extends http.IncomingMessage, RequestObjectProps {}

export interface ContextObject {
  req: RequestObject;
  res: ResponseObject;
  body?: any;
  params?: any;
  query?: any;
}

// TYPES

export type NextFunction = (args?: any) => void;
export type Middleware = (obj: ContextObject, next?: NextFunction) => void;
export type RequestMethod = "get" | "post" | "put" | "patch" | "delete" | "options";
export type RequestFunction = { [method: string]: Middleware };
export type Route = { [url: string]: RequestFunction };
export type Routes = Route[];
