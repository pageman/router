type HtppMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";
type UrlObject = { [key: string]: string };
type RequestHandler = { path: string; query: UrlObject; headers: HttpHeaders; method: HtppMethods; body: any };
type ResponseHandler = any;
type Callback = (request: RequestHandler, response: ResponseHandler) => void;

interface HttpHeaders {
  accept: string;
  host: string;
  connection: string;
  "content-type": string;
  "user-agent": string;
  "cache-control": string;
  "accept-encoding": string;
  "content-length": string;
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

export { Route, HtppMethods, HttpHeaders, RequestHandler, ResponseHandler, UrlObject };
