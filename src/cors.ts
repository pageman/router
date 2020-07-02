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

export = function (options?: CorsOptions): ExpressMiddleware {
  return (req: http.IncomingMessage, res: http.ServerResponse, next: NextFunction, error: any) => {
    next();
  };
};
