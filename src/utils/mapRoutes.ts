import { MayaJsRoute } from "../interface";

// We use '+' instead of template string '${}' because of performance gain
// See https://stackoverflow.com/questions/6094117/prepend-text-to-beginning-of-string
const sanitizePath = (path: string) => (path.startsWith("/") ? path : "/" + path);

export default (router: any) => {
  // Recursive function for mapping array of routes
  const mapRoutes = (parent = "") => (route: MayaJsRoute) => {
    // Create parent route
    parent = parent.length > 0 ? sanitizePath(parent) : "";

    // Add route to list
    router.addRouteToList(route, parent);

    const routePath = parent + sanitizePath(route.path);

    if (route?.children !== undefined && route?.loadChildren !== undefined) {
      throw new Error(`Property 'loadChildren' can't be used with 'children' in route '${routePath}'`);
    }

    // Check if route has children
    if (route?.children && route?.children.length > 0) {
      // Map children's routes
      route.children.map(mapRoutes(routePath));
    }
  };

  return mapRoutes;
};
