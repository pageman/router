import { MayaJsRoute, MayaJsContext, MayaJSRouteParams, VisitedRoutes, RequestMethods, MayaRouter, Middlewares } from "../interface";
import regex from "../utils/regex";

// Export default route object
export const app: MayaRouter = {
  routes: {},
  routesWithParams: {},
  visitedRoutes: {},
  middlewares: [],
} as any;

app.add = function (path: string, routes: MayaJsRoute | MayaJsRoute[]) {
  // Check if routes is an array
  if (!Array.isArray(routes)) return this.addRouteToList(path, routes);

  // Map routes and add each route to the list
  routes.map((route) => this.addRouteToList(path, route));
};

app.addRouteToList = function (path: string, route: MayaJsRoute) {
  // Check if path has params
  const hasParams = path.includes("/:");

  //  Check if path has a param and select the correct route list
  const list = !hasParams ? "routes" : "routesWithParams";

  // Initialize path if undefined
  if (!this[list][path]) {
    this[list][path] = {} as any;
  }

  // Add route to list
  this[list][path][route.method] = { middlewares: [], dependencies: [], ...route, regex: regex(path) };
};

app.init = function () {
  // Initialize mayajs router
};

app.use = function (middleware: Middlewares) {
  // Add middleware to the list
  if (middleware) {
    this.middlewares.push(middleware);
  }
  return this;
};

app.findRoute = function (path: string, method: RequestMethods): MayaJSRouteParams | null {
  // Check if path exist on `routes`
  let route = this?.routes && this?.routes[path] ? this?.routes[path] : null;

  // Check if path exist on `routesWithParams`
  if (!route) {
    // Get keys from `routesWithParams` object
    const routeWithParamsKeys = Object.keys(this.routesWithParams);

    for (const key of routeWithParamsKeys) {
      // Get current route from key
      const current = this.routesWithParams[key];

      // Test if path will pass the route path regex pattern
      if (current[method].regex.test(path)) {
        route = current;
        break;
      }
    }
  }

  // Check if route method is same as the request
  return route ? route[method] : null;
};

app.executeRoute = async function (path: string, route: MayaJSRouteParams, context: MayaJsContext) {
  // Set message variable
  let message = "";

  try {
    // Try to execute route callback
    message = await route.callback(context);

    if (!this.visitedRoutes[path]) {
      // Initialize path for caching
      this.visitedRoutes[path] = {} as any;
    }

    if (!this.visitedRoutes[path][route.method]) {
      // Cache path route if not on visited routes
      this.visitedRoutes[path][route.method] = { ...route, params: context.params, query: context.query, body: context.body };
    }
  } catch (error) {
    // Catch error when running callback
    message = error;
  }

  return message;
};

app.visitedRoute = function (path: string, method: RequestMethods): VisitedRoutes | null {
  return this?.visitedRoutes && this?.visitedRoutes[path] && this?.visitedRoutes[path][method] ? this?.visitedRoutes[path][method] : null;
};
