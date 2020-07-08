import http from "http";
import { NextFunction, ExpressMiddleware, CorsOptions, HttpMethods } from ".";

function setMaxAge(age: number) {
  return { "Access-Control-Max-Age": age.toString() };
}

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

function setAllowedHeaders(allowedHeaders: any, requestHeaders: any) {
  let headers = {};
  let vary = {};

  if (!allowedHeaders) {
    allowedHeaders = requestHeaders;
    vary = { Vary: "Access-Control-Request-Headers" };
  } else if (Array.isArray(allowedHeaders)) {
    allowedHeaders = allowedHeaders.join(",");
  }

  if (allowedHeaders && allowedHeaders.length) {
    headers = { "Access-Control-Allow-Headers": allowedHeaders };
  }

  return { ...headers, ...vary };
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
  const {
    origin = "*",
    methods = ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    credentials = false,
    exposedHeaders = [],
    allowedHeaders = [],
    maxAge = 2592000,
  } = options;

  return (req: http.IncomingMessage, res: http.ServerResponse, next: NextFunction, _error: any) => {
    const method = req.method && req.method.toUpperCase && req.method.toUpperCase();

    if (origin) {
      headers.push(setOrigin(req.headers.origin, origin));
    }

    if (credentials) {
      headers.push(setCredentials());
    }

    if (exposedHeaders.length) {
      headers.push(setExposedHeaders(exposedHeaders));
    }

    // PROCEED TO ROUTES
    if (method !== "OPTIONS") {
      setHeaders(res, headers);
      return next();
    }

    // PRE-FLIGHT MODE

    if (methods.length > 0) {
      headers.push(setMethods(methods));
    }

    if (maxAge <= 0) {
      headers.push(setMaxAge(maxAge));
    }

    if (allowedHeaders.length > 0) {
      headers.push(setAllowedHeaders(allowedHeaders, req.headers["access-control-request-headers"]));
    }

    setHeaders(res, headers);

    res.statusCode = 204;
    res.setHeader("Content-Length", "0");
    res.end();
    return;
  };
};
