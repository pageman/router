import { MayaJsRouter, ExpressJsMiddleware, MayaJsMiddleware, CustomModule, MayaJsRoute, RouterMapper } from "./interface";
import app from "./router";

export interface ExpressMiddlewares extends ExpressJsMiddleware {}
export interface MayaMiddlewares extends MayaJsMiddleware {}
export * from "./interface";
export * from "./utils/constants";

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

export class RoutesMapper {}

export class RouterModule extends CustomModule {
  static routes: MayaJsRoute[] = [];
  static isRoot = false;

  constructor(private mapper: RouterMapper, private parentName: string = "") {
    super();
  }

  invoke() {
    if (!RouterModule.isRoot) {
      throw new Error("RouterModule is not properly called using 'forRoot'.");
    }

    RouterModule.routes.map(this.mapper(this.parentName));
  }

  static forRoot(routes: MayaJsRoute[]) {
    RouterModule.isRoot = true;
    RouterModule.routes = routes;
    return { module: RouterModule, providers: [], dependencies: [RoutesMapper, String] };
  }
}

export default maya;
