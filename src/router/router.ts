import { MayaJsRequest, MayaJsResponse, MayaJsRoute, MethodNames, Middlewares, VisitedRoutes } from "../interface";
import routeMapper from "../utils/mapRoutes";
import middleware from "./middleware";
import functions from "./functions";

const app: any = {};

let router: any;
let mapRoutes: any;

app.add = function (routes: MayaJsRoute[]) {
  // Check if routes is an array
  if (!Array.isArray(routes)) return router.addRouteToList(routes);

  // Map routes and add each route to the list
  routes.map(mapRoutes());
};

app.init = function () {
  const props: any = { routes: {}, routesWithParams: {}, visitedRoutes: {}, middlewares: [], context: {} };

  // Add default headers
  app["headers"] = { "X-Powered-By": "MayaJS" };

  // Initialize mayajs router
  router = functions(props);
  mapRoutes = routeMapper(router);
};

app.use = function (middleware: Middlewares) {
  // Add middleware to the list
  if (middleware) {
    router.middlewares.push(middleware);
  }
  return this;
};

// Sends a reponse message and ending the request
const send = async (req: MayaJsRequest, res: MayaJsResponse, parsedUrl: any) => {
  // Get current method
  const method = req.method as MethodNames;

  // Get path name
  const routePath = parsedUrl.pathname;

  // Check if path exist in visited routes or in non-param routes
  const route = router.visitedRoute(routePath, method) || router.findRoute(routePath, method);

  if (!route) {
    // Route was not found. Send back an error message
    return res.send({ message: `Route path of '${routePath}' was not found!` }, 404);
  }

  try {
    Object.keys(app.headers).map((key) => res.setHeader(key, app.headers[key]));

    // Create MayaJS params
    const params = (route as VisitedRoutes).params || { ...route.regex.exec(routePath)?.groups };

    // Create MayaJS context
    router.context = { req, res, query: { ...parsedUrl.query }, params, body: req?.body };

    // Create a factory method for executing current route
    const execute = async () => res.send(await router.executeRoute(routePath, route));

    // Run middlewares before calling the main route callback
    middleware([...router.middlewares, ...(route.middlewares as Middlewares[])], router.context, execute);
  } catch (error) {
    // Send error back to client
    res.send(error);
  }
};

// Create mayajs router by merging the handler and functions
export { app, send };
