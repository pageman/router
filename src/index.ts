import { MayaJsRouter, ExpressJsMiddleware, MayaJsMiddleware } from "./interface";
import app from "./router/maya";

export interface ExpressMiddlewares extends ExpressJsMiddleware {}
export interface MayaMiddlewares extends MayaJsMiddleware {}

/**
 * A Nodejs library for managing routes. MayaJs use a declarative way of defining routes.
 * It also cache visited routes for faster execution of route callback.
 *
 * ```
 * import maya from "@mayajs/router";
 * import http from "http";
 *
 * const app = mayajs();
 *
 * app.add("", [
 *   {
 *     method: "GET",
 *     middlewares: [],
 *     callback: () => {
 *       return 'Hello, World!';
 *     },
 *   },
 * ]);
 *
 * http.createServer(app).listen(PORT, () => {
 *  console.log(`Server listening on port ${PORT}.`);
 * });
 * ```
 *
 * @return MayaJsRouter
 */
function maya(): MayaJsRouter {
  // Initialize MayaJs router
  app.init();

  // Return MayaJs router
  return app;
}

export default maya;
