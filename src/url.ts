import { Routes } from "./interfaces";

export = class Url {
  find(routes: Routes, url: string = ""): { index: number; found: boolean; params: RegExpExecArray | null; key: string } {
    let index: number = -1;
    let key = url;
    let params = null;

    // Find the key for the route if existed
    const found = routes.some((route: any, idx: number): boolean => {
      const routeKey = Object.keys(route)[0];

      // Generate regex based on the current route
      const regex = this.toRegex(routeKey);

      // Check if route has request params
      const hasParams = regex.test(url);

      if (hasParams) {
        // Set key to current route key
        key = routeKey;

        // Retrieve params if there are any
        params = regex.exec(url);
      }

      index = idx;
      return Boolean(route[url]) || hasParams;
    });

    return { index, found, params, key };
  }

  private toRegex(url: string) {
    const base = (val: string) => new RegExp(`^${val}$`);
    const notParam = (val: string) => `(?:\\/(${val}))`;
    const isParam = (val: string) => `(?:\\/(?<${val}>[\\w\\-]+?))`;
    const regex = url
      .split("/")
      .map((val) => (val.includes(":") ? isParam(val.substring(1)) : notParam(val)))
      .join("");

    return base(regex);
  }
};
