import {
  CustomModule,
  MayaJsRoute,
  MayaJsRouter,
  ModuleImports,
  ModuleWithProviders,
  RouterFunction,
  RouterMapper,
  RouterMapperFactory,
  RouterMethods,
  RouterProps,
  Type,
} from "../interface";
import { sanitizePath } from "./helpers";

const mapModules = (router: RouterProps & RouterMethods, app: MayaJsRouter, parent: string) => (imported: ModuleImports) => {
  const args: any[] = [];
  let tempMod;

  if ((imported as ModuleWithProviders)?.module) tempMod = (imported as ModuleWithProviders).module;
  if (!imported.hasOwnProperty("module")) tempMod = imported as Type<CustomModule>;
  if (!tempMod) return;
  if (tempMod.name === "RouterModule") {
    args.push(routeMapper(router, app));
    args.push(parent);
  }

  const _module = new tempMod(...args);

  _module.invoke();
  _module.imports.map(mapModules(router, app, parent));
};

const routeMapper: RouterMapperFactory = (router: RouterFunction, app: MayaJsRouter): RouterMapper => {
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
