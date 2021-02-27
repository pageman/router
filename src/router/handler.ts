import { MayaJsRequest, MayaJsResponse, MayaJSRouteParams, Middlewares, RequestMethods, VisitedRoutes } from "../interface";
import response from "./response";
import middleware from "./middleware";
import app from "./maya";
import url from "url";

async function handler(req: MayaJsRequest, res: MayaJsResponse) {
  // Inititalize MayaJS ResponseObject
  res = response(res);

  // Set local variables
  const parsedUrl = url.parse(req.url ?? "", true);
  const routePath = parsedUrl.pathname;

  if (!routePath) {
    // Path is invalid
    return res.send({ message: `Route path of ${routePath} is invalid!` }, 404);
  }

  // Sends a reponse message and ending the request
  const send = async (route: VisitedRoutes | MayaJSRouteParams) => {
    try {
      const params = (route as VisitedRoutes).params || { ...route.regex.exec(routePath)?.groups };
      const context = { req, res, query: { ...parsedUrl.query }, params };
      const execute = async (ctx: any) => {
        const result = await app.executeRoute(routePath, route, ctx);
        res.send(result);
      };

      middleware([...app.middlewares, ...(route.middlewares as Middlewares[])], { ...context, body: req?.body }, execute);
    } catch (error) {
      console.log(error);
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
