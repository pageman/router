import http from "http";

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
export interface ContextObject {
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
 * A middleware function that accepts a 'context' object that contains all the request inforamtion
 * and 'next' function that will execute the next middleware
 */
export type Middleware = (obj: ContextObject, next?: NextFunction) => void;

/**
 * A list of http method in lower case
 */
export type RequestMethod = "get" | "post" | "put" | "patch" | "delete" | "options";

/**
 * An object to represent a route method function
 */
export type RequestMethodFunction = { [method: string]: Middleware };

/**
 * A MayaJS route object
 */
export type Route = { [url: string]: RequestMethodFunction };

/**
 * A list of MayaJS Route
 */
export type Routes = Route[];
