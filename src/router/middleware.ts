import { MayaJSMiddleware, ExpressMiddleware } from "../";
import http from "http";

/**
 * A helper function for invoking a list of MayaJS or ExpressJS middlewares.
 *
 * @param req Request object from http.IncomingMessage
 * @param res Response object from http.ServerResponse
 * @param middlewares List of middlewares
 * @param error A message from the previous middleware
 */
export = function invoker(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  middlewares: (MayaJSMiddleware | ExpressMiddleware)[],
  error?: any
): void | Promise<void> {
  if (!middlewares.length) return;

  const mid = middlewares[0] as MayaJSMiddleware | ExpressMiddleware;
  const next = async (error: any) => {
    await invoker(req, res, middlewares.slice(1), error);
  };

  if (mid.length > 2) {
    return (<ExpressMiddleware>mid)(req, res, next, error);
  }

  return (<MayaJSMiddleware>mid)({ req, res, error }, next);
};
