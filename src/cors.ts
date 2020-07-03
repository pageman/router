import http from "http";
import { NextFunction, ExpressMiddleware, CorsOptions, HttpMethods } from ".";

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
  const { origin = "*", methods = ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"] } = options;

  return (req: http.IncomingMessage, res: http.ServerResponse, next: NextFunction, _error: any) => {
    if (origin) {
      headers.push(setOrigin(req.headers.origin, origin));
    }

    if (methods?.length) {
      headers.push(setMethods(methods));
    }

    setHeaders(res, headers);

    next();
  };
};
