import { RouterDependencies, CustomModule, ModuleProviders, Type, RouterProps, RouterMapper, MayaJsModule } from "../interface";
import merge from "./merge";

// We use '+' instead of template string '${}' because of performance gain
// See https://stackoverflow.com/questions/6094117/prepend-text-to-beginning-of-string
export const sanitizePath = (path: string) => {
  if (path === "" || path === "/") {
    return "";
  }

  if (path.startsWith("/")) {
    return path;
  }

  return "/" + path;
};

export const getFunctionProps = <T>(func: Function | Object): T => {
  const _this: any = {};

  for (const prop in func) {
    _this[prop] = (func as any)[prop];
  }

  return _this;
};

const mapProviders = (name: string, _module?: CustomModule | MayaJsModule | null): undefined | ModuleProviders | Function => {
  if (!_module) return;
  const index = _module?.providers?.findIndex((item) => item.name === name);
  return index > -1 ? _module?.providers[index] : mapProviders(name, _module.parent);
};

const findDependency = (name: string, dependencies: RouterDependencies, props: RouterProps, _module?: CustomModule | MayaJsModule | null) => {
  if (dependencies[name] && name === "RoutesMapper") return (dependencies[name] as (...args: any) => RouterMapper)(props, props, _module);
  if (dependencies[name]) return dependencies[name];

  const provider = mapProviders(name, _module) as Type<ModuleProviders>;

  if (provider) {
    dependencies[name] = new provider();
    return dependencies[name];
  }
};

export function mapDependencies(routerDep: RouterDependencies, _module?: CustomModule | MayaJsModule | null, dependencies?: any[]) {
  const props = getFunctionProps<RouterProps>(mapDependencies);
  const _dependencies = dependencies ?? _module?.dependencies;
  return _dependencies ? _dependencies.map((dep) => findDependency(dep.name, routerDep, props, _module) ?? undefined) : [];
}

export const dependencyMapperFactory = (app: RouterProps) => merge(mapDependencies, app);
