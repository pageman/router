import { RouterDependencies, CustomModule, ModuleProviders, Type } from "../interface";

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

const mapProviders = (name: string, _module?: CustomModule | null): undefined | ModuleProviders | Function => {
  if (!_module) return;
  const index = _module?.providers.findIndex((item) => item.name === name);
  return index > -1 ? _module?.providers[index] : mapProviders(name, _module.parent);
};

const findDependency = (name: string, dependencies: RouterDependencies, _module?: CustomModule | null) => {
  if (dependencies[name]) return dependencies[name];

  const provider = mapProviders(name, _module) as Type<ModuleProviders>;

  if (provider) {
    dependencies[name] = new provider();
    return dependencies[name];
  }
};

export const mapDependencies = (routerDep: RouterDependencies, _module?: CustomModule | null, dependencies?: any[]) => {
  return dependencies ? dependencies.map((dep) => findDependency(dep.name, routerDep, _module) ?? null) : [];
};
