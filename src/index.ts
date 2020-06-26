import { Routes, RequestMethod, Middleware, MethodFunction } from "./interfaces";
import methods from "./methods";

interface Router {
  get: MethodFunction;
  post: MethodFunction;
  put: MethodFunction;
  patch: MethodFunction;
  delete: MethodFunction;
  options: MethodFunction;
}

class Router {
  constructor(private routes: Routes = []) {}

  add(method: RequestMethod, url: string, fn: Middleware) {
    let urlIndex: number = -1;

    // Add the function and the path as the key on the routes object
    const urlFound = this.routes.some((item: any, index: number): boolean => {
      urlIndex = index;
      return Boolean(item[url]);
    });

    if (urlIndex >= 0 && urlFound) {
      // add method to existing object in routes array
      this.routes[urlIndex][url] = { [method]: fn };
      return;
    }

    // add method new object in routes array
    this.routes.push({ [url]: { [method]: fn } });
  }

  requestHandler(options: { method: RequestMethod; url: string; fn?: Middleware }): void {
    console.log(options);
  }
}

methods.forEach((method: RequestMethod) => {
  Router.prototype[method] = function (url: string, fn: Middleware) {
    return this.add(method, url, fn);
  };
});

export = Router;
