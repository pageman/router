import http from "http";

type HtppMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
type UrlObject = { [key: string]: string };
type RequestHandler = { path: string; query: UrlObject; headers: HttpHeaders; method: HtppMethods; body: any };
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

interface Method {
  path: string;
}

interface GetMethod extends Method {
  GET: Callback;
}

interface PostMethod extends Method {
  POST: Callback;
}

interface PatchMethod extends Method {
  PATCH: Callback;
}

interface PutMethod extends Method {
  PUT: Callback;
}

interface DeleteMethod extends Method {
  DELETE: Callback;
}

interface OptionsMethod extends Method {
  OPTIONS: Callback;
}

type Route = GetMethod | PostMethod | PatchMethod | PutMethod | DeleteMethod | OptionsMethod;

interface Routes extends Partial<Record<HtppMethods, { [key: string]: Callback }>> {}

export { Route, HtppMethods, HttpHeaders, RequestHandler, ResponseHandler, UrlObject, Routes };
