import { RequestMethod, Middleware, MethodFunction } from "./interfaces";
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
  requestHandler(options: { method: RequestMethod; url: string; fn?: Middleware }): void {
    console.log(options);
  }
}

methods.forEach((method: RequestMethod) => {
  Router.prototype[method] = function (url: string, fn?: Middleware) {
    return this.requestHandler({ method, url, fn });
  };
});

export = Router;
