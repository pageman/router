import http from "http";
import { NextFunction, ExpressMiddleware, CorsOptions, HttpMethods } from ".";

function setExposedHeaders(headers: string[]) {
  const value = Array.isArray(headers) ? headers.join(",") : headers;
  return { "Access-Control-Expose-Headers": value };
}

function setCredentials() {
  return { "Access-Control-Allow-Credentials": "true" };
}

function setMethods(methods: HttpMethods[]) {
  const value = Array.isArray(methods) ? methods.join(",") : methods;
  return { "Access-Control-Allow-Methods": value };
}

function setOrigin(requestOrigin: string | string[] | undefined, origin: string): { [key: string]: string } {
  let value = origin;
  let vary = {};

  if (origin !== "*") {
    vary = { Vary: "Origin" };
  }

  if (requestOrigin === origin) {
    value = requestOrigin;
  }

  return { "Access-Control-Allow-Origin": value, ...vary };
}

function setHeaders(res: http.ServerResponse, headers: { [key: string]: string }[]) {
  headers.map((value: any) => {
    const key = Object.keys(value)[0];
    res.setHeader(key, value[key]);
  });
}

export = function (options: CorsOptions = {}): ExpressMiddleware {
  const headers: { [key: string]: string }[] = [];
  const { origin = "*", methods = ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"], credentials = false, exposedHeaders = [] } = options;

  return (req: http.IncomingMessage, res: http.ServerResponse, next: NextFunction, _error: any) => {
    const method = req.method && req.method.toUpperCase && req.method.toUpperCase();

    if (origin) {
      headers.push(setOrigin(req.headers.origin, origin));
    }

    if (methods.length) {
      headers.push(setMethods(methods));
    }

    if (credentials) {
      headers.push(setCredentials());
    }

    if (exposedHeaders.length) {
      headers.push(setExposedHeaders(exposedHeaders));
    }

    setHeaders(res, headers);

    if (method === "OPTIONS") {
      // PRE-FLIGHT MODE
      res.statusCode = 204;
      res.setHeader("Content-Length", "0");
      res.end();
      return;
    }

    next();
  };
};
