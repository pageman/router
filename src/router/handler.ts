import { MayaJsContext, MayaJsRequest, MayaJsResponse, MayaJSRouteParams, Middlewares, RequestMethods, VisitedRoutes } from "../interface";
import response from "./response";
import middleware from "./middleware";
import app from "./maya";
import url from "url";

async function handler(req: MayaJsRequest, res: MayaJsResponse) {
  // Inititalize MayaJS ResponseObject
  res = response(res);

  // Set local variables
  const parsedUrl = url.parse(req.url ?? "", true);

  // Get path name
  const routePath = parsedUrl.pathname;

  if (!routePath) {
    // Path is invalid
    return res.send({ message: `Route path of ${routePath} is invalid!` }, 404);
  }

  // Sends a reponse message and ending the request
  const send = async (route: VisitedRoutes | MayaJSRouteParams) => {
    try {
      // Create MayaJS params
      const params = (route as VisitedRoutes).params || { ...route.regex.exec(routePath)?.groups };

      // Create MayaJS context
      const context = { req, res, query: { ...parsedUrl.query }, params, body: req?.body };

      // Create a factory method for executing current route
      const execute = async (ctx: MayaJsContext) => res.send(await app.executeRoute(routePath, route, ctx));

      // Run middlewares before calling the main route callback
      middleware([...app.middlewares, ...(route.middlewares as Middlewares[])], context, execute);
    } catch (error) {
      // Send error back to client
      res.send(error);
    }
  };

  const method = req.method as RequestMethods;

  // Check if path exist in visited routes or in non-param routes
  const route = app.visitedRoute(routePath, method) || app.findRoute(routePath, method);

  if (!route) {
    // Route was not found. Send back an error message
    return res.send({ message: `Route path of '${routePath}' was not found!` }, 404);
  }

  // Sends result back and end request
  send(route);
}

export default handler;
