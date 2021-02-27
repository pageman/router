import { MayaJsRouter, ExpressJsMiddleware, MayaJsMiddleware } from "./interface";
import app from "./router/maya";

export interface ExpressMiddlewares extends ExpressJsMiddleware {}
export interface MayaMiddlewares extends MayaJsMiddleware {}

/**
 * A Nodejs library for managing routes. MayaJs use a declarative way of defining routes.
 * It also cache visited routes for faster execution of route callback.
 *
 * ```
 * const app = mayajs();
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
