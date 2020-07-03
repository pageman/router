import http from "http";
import { NextFunction, ExpressMiddleware } from ".";

interface CorsOptions {
  origin?: string;
  methods?: "GET" | "HEAD" | "PUT" | "PATCH" | "POST" | "DELETE";
  allowedHeaders?: string;
  exposedHeaders?: string;
  credentials?: string;
  maxAge?: number;
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

export = function (options: CorsOptions = {}): ExpressMiddleware {
  const headers: { [key: string]: string }[] = [];
  const { origin = "*" } = options;

  return (req: http.IncomingMessage, res: http.ServerResponse, next: NextFunction, error: any) => {
    if (origin) {
      headers.push(setOrigin(req.headers.origin, origin));
    }

    next();
  };
};
