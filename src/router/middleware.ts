import { ExpressJsMiddleware, MayaJsContext, MayaJsMiddleware, Middlewares } from "../interface";

/**
 * A helper function for invoking a list of MayaJS or ExpressJS middlewares.
 *
 * @param req Request object from http.IncomingMessage
 * @param res Response object from http.ServerResponse
 * @param middlewares List of middlewares
 * @param error A message from the previous middleware
 */
function middleware(middlewares: Middlewares[], ctx: MayaJsContext, callback: any, error?: any): void | Promise<void> {
  if (!middlewares.length) return callback(ctx);

  const { req, res } = ctx;
  const current = middlewares[0];

  const next = async (error: any) => {
    await middleware(middlewares.slice(1), { ...ctx, req, res }, callback, error);
  };

  // Check if arguments are more than 2
  if (current.length > 2) {
    return (<ExpressJsMiddleware>current)(req, res, next, error);
  }

  return (<MayaJsMiddleware>current)({ req, res, error, query: ctx.query, params: ctx.params, body: req.body }, next);
}

export default middleware;
