import { MayaJsRoute, MayaJSRouteParams, VisitedRoutes, MethodNames, RouteCallback, RouteMethod, RouterMethods, RouterProps } from "../interface";
import merge from "../utils/merge";
import regex from "../utils/regex";

// Export default route object
const router: any = {};

// We use '+' instead of template string '${}' because of performance gain
// See https://stackoverflow.com/questions/6094117/prepend-text-to-beginning-of-string
const sanitizePath = (path: string) => (path.startsWith("/") ? path : "/" + path);

router.addRouteToList = function (route: MayaJsRoute, parent = "") {
  // Sanitize current route path
  const path = parent + sanitizePath(route.path);

  // Check if path has params
  const hasParams = path.includes("/:");

  //  Check if path has a param and select the correct route list
  const list = !hasParams ? "routes" : "routesWithParams";

  // Initialize path if undefined
  if (!this[list][path]) this[list][path] = {} as any;

  const methods = ["GET", "POST", "PUT", "HEAD", "DELETE", "OPTIONS", "PATCH"];

  if (route.controller && route.hasOwnProperty("controller")) {
    const controller = new route.controller();
    const controllerProps = Object.getOwnPropertyNames(Object.getPrototypeOf(controller)) as MethodNames[];

    controllerProps.map((key: MethodNames) => {
      if (methods.includes(key)) {
        let middlewares = controller?.middlewares?.[key] ?? [];

        // Create callback function
        const callback = controller[key];

        // Add route to list
        this[list][path][key] = { middlewares, dependencies: [], method: key, regex: regex(path), callback };
      }
    });
    return;
  }

  (Object.keys(route) as MethodNames[]).map((key): void => {
    if (methods.includes(key) && route.hasOwnProperty("controller")) {
      throw new Error(`Property controller can't be used with ${key} method on route '${path}'`);
    }

    // Check if key is a method
    if (methods.includes(key) && !route.hasOwnProperty("controller")) {
      // Get current method
      const current = route[key] as RouteMethod;

      // Set default middlewares from route
      let middlewares = route?.middlewares ?? [];

      // Check if current method has middlewares
      if (current?.middlewares) {
        middlewares = [...middlewares, ...current.middlewares];
      }

      // Create callback function
      const callback = current?.callback ?? (route[key] as RouteCallback);

      // Add route to list
      this[list][path][key] = { middlewares, dependencies: [], method: key, regex: regex(path), callback };
    }
  });
};

router.findRoute = function (path: string, method: MethodNames): MayaJSRouteParams | null {
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

router.executeRoute = async function (path: string, route: MayaJSRouteParams) {
  // Set message variable
  let message = "";

  try {
    const context = this.context;
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

router.visitedRoute = function (path: string, method: MethodNames): VisitedRoutes | null {
  return this?.visitedRoutes && this?.visitedRoutes[path] && this?.visitedRoutes[path][method] ? this?.visitedRoutes[path][method] : null;
};

export default (app: RouterProps) => merge(app, router as RouterMethods);
