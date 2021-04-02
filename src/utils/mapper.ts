import { CustomModule, ModuleCustomType, ModuleMapper, ModuleMapperFactory, ModuleWithProviders, RouterMapper, RouterMapperFactory } from "../interface";
import { sanitizePath } from "./helpers";

export const mapDependencies = (dependencies?: any[]) => {
  return dependencies ? dependencies.map((dep) => (dep.constructor.name === "Function" ? new dep() : null)) : [];
};

const mapModules: ModuleMapperFactory = (router, app, parentRoute, parentModule = null): ModuleMapper => (imported) => {
  const args: any[] = [];
  let currentModule;

  if ((imported as ModuleWithProviders)?.module) currentModule = (imported as ModuleWithProviders).module;
  if (!imported.hasOwnProperty("module")) currentModule = imported as ModuleCustomType;
  if (!currentModule) return;
  if (currentModule.name === "RouterModule") {
    args.push(routeMapper(router, app, parentModule));
    args.push(parentRoute);
  }

  const _module = new currentModule(...args);

  if (parentModule) {
    _module.parent = parentModule;
  }

  _module.invoke();
  _module.imports.map(mapModules(router, app, parentRoute, _module));
};

const declarationsMapper = (_module: CustomModule | null, name: string = ""): boolean => {
  let isDeclared = false;

  if (_module) {
    isDeclared = _module.declarations.some((item) => item.name === name);
  }

  if (!isDeclared && _module !== null) {
    return declarationsMapper(_module.parent, name);
  }

  return isDeclared;
};

const routeMapper: RouterMapperFactory = (router, app, _module = null): RouterMapper => {
  // Recursive function for mapping array of routes
  const mapRoutes: RouterMapper = (parent = "") => (route) => {
    // Create parent route
    parent = parent.length > 0 ? sanitizePath(parent) : "";

    // Sanitize route path
    route.path = parent + sanitizePath(route.path);

    const controllerName = route?.controller?.name;
    const moduleName = _module?.constructor.name;
    const isDeclared = declarationsMapper(_module, controllerName);

    if (!isDeclared && _module !== null) {
      throw new Error(`${controllerName} is not declared in ${moduleName}`);
    }

    // Add route to list
    router.addRouteToList(route, _module);

    if (route?.children !== undefined && route?.loadChildren !== undefined) {
      throw new Error(`Property 'loadChildren' can't be used with 'children' in route '${route.path}'`);
    }

    if (route?.controller !== undefined && route?.loadChildren !== undefined) {
      throw new Error(`Property 'loadChildren' can't be used with 'controller' in route '${route.path}'`);
    }

    // Check if route has children
    if (route?.children && route?.children.length > 0) {
      // Map children's routes
      route.children.map(mapRoutes(route.path));
    }

    if (route?.loadChildren) {
      route
        ?.loadChildren()
        .then(mapModules(router, app, route.path, _module))
        .catch((error) => {
          console.log(`\x1b[31m${error}\x1b[0m`);
        });
    }
  };

  return mapRoutes;
};

export default routeMapper;
