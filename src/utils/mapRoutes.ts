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

    // Check if route has children
    if (route?.children && route?.children.length > 0) {
      // Map children's routes
      route.children.map(mapRoutes(parent + sanitizePath(route.path)));
    }
  };

  return mapRoutes;
};
