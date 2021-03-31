import { MayaJsRouter, ExpressJsMiddleware, MayaJsMiddleware, CustomModule, MayaJsRoute, RouterMapper } from "./interface";
import app from "./router";

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
 * app.add([
 *   {
 *    path: "hello",
 *    GET: ({ req, body, params, query }) => {
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

export class RouterModule extends CustomModule {
  static routes: MayaJsRoute[] = [];
  static isRoot = false;

  constructor(mapRoutes: RouterMapper, parent: string) {
    RouterModule.routes.map(mapRoutes(parent));
    super();
  }

  invoke() {
    if (!RouterModule.isRoot) {
      throw new Error("RouterModule is not properly called using 'forRoot'.");
    }
  }

  static forRoot(routes: MayaJsRoute[]) {
    RouterModule.isRoot = true;
    RouterModule.routes = routes;
    return {
      module: RouterModule,
      providers: [],
    };
  }
}

export default maya;
