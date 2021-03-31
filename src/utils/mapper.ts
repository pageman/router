import { ModuleCustomType, ModuleMapper, ModuleMapperFactory, ModuleWithProviders, RouterMapper, RouterMapperFactory } from "../interface";
import { sanitizePath } from "./helpers";

const mapModules: ModuleMapperFactory = (router, app, parent): ModuleMapper => (imported) => {
  const args: any[] = [];
  let currentModule;

  if ((imported as ModuleWithProviders)?.module) currentModule = (imported as ModuleWithProviders).module;
  if (!imported.hasOwnProperty("module")) currentModule = imported as ModuleCustomType;
  if (!currentModule) return;
  if (currentModule.name === "RouterModule") {
    args.push(routeMapper(router, app));
    args.push(parent);
  }

  const _module = new currentModule(...args);

  _module.invoke();
  _module.imports.map(mapModules(router, app, parent));
};

const routeMapper: RouterMapperFactory = (router, app): RouterMapper => {
  // Recursive function for mapping array of routes
  const mapRoutes: RouterMapper = (parent = "") => (route) => {
    // Create parent route
    parent = parent.length > 0 ? sanitizePath(parent) : "";

    // Add route to list
    router.addRouteToList(route, parent);

    const routePath = parent + sanitizePath(route.path);

    if (route?.children !== undefined && route?.loadChildren !== undefined) {
      throw new Error(`Property 'loadChildren' can't be used with 'children' in route '${routePath}'`);
    }

    if (route?.controller !== undefined && route?.loadChildren !== undefined) {
      throw new Error(`Property 'loadChildren' can't be used with 'controller' in route '${routePath}'`);
    }

    // Check if route has children
    if (route?.children && route?.children.length > 0) {
      // Map children's routes
      route.children.map(mapRoutes(routePath));
    }

    if (route?.loadChildren) {
      try {
        route?.loadChildren().then(mapModules(router, app, routePath));
      } catch (error) {
        console.log(error);
      }
    }
  };

  return mapRoutes;
};

export default routeMapper;
