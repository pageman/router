import http from "http";

type HttpMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
type UrlObject = { [key: string]: string };
type RequestHandler = { path: string; query: UrlObject; headers: HttpHeaders; method: HttpMethods; body: any };
type Callback = (request: RequestHandler, response: ResponseHandler) => void;

interface ResponseHandler extends http.ServerResponse {
  send: (value: string | number | object) => void;
}

interface HttpHeaders {
  accept: string;
  host: string;
  connection: string;
  "content-type": string;
  "user-agent": string;
  "cache-control": string;
  "content-length": string;
  "accept-encoding"?: string;
}

type Method = { [key: string]: Callback };
type Routes = { [key in HttpMethods]?: Method };
type RoutesMethod = { [key in HttpMethods]?: Callback };

interface Route extends RoutesMethod {
  path: string;
}

export { Route, HttpMethods, HttpHeaders, RequestHandler, ResponseHandler, UrlObject, Routes, Callback };
