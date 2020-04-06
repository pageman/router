import http from "http";
import url from "url";
import { Route, Routes, RequestHandler, ResponseHandler, HttpMethods, UrlObject, HttpHeaders, Callback } from "./interface";

class Router {
  private routes: Routes = {
    GET: {},
    POST: {},
    PUT: {},
    PATCH: {},
    DELETE: {},
    OPTIONS: {},
  };

  constructor() {}

  /**
   * Add a route to be mapped on the routes object.
   * @example
   * add({
   *   path: "route",
   *   GET: (req, res) => {
   *      // handle request here
   *   },
   * })
   */
  add(route: Route): void {
    // Get the method type of the route
    const method = Object.keys(route)[1] as HttpMethods;

    // Get the function associated with the method
    const value = route[method] as Callback;

    // Add the function and the path as the key on the routes object
    this.routes[method][route.path] = value;
  }

  /**
   * Initialize the routes and event listeners.
   *
   * @return { Function }
   *         Anonymous function.
   */
  initialize(): (request: http.IncomingMessage, response: http.ServerResponse) => void {
    return (request: http.IncomingMessage, response: http.ServerResponse) => {
      // Define default send function
      (response as any)["send"] = this.requestSender(response);

      let body = "";

      // Concat chunks of data
      const chunk = (chunks: any) => {
        body += chunks;
      };

      // Get data from the REQUEST
      request.on("data", chunk);

      // Listen to end event
      request.on("end", this.requestEndListener(request, response, body));
    };
  }

  /**
   * Builds a request handler object.
   *
   * @param {url.UrlWithParsedQuery} parsedURL
   *        Parsed url string from `request.url`.
   *
   * @param {Object} request
   *         An object that describe the request.
   *
   * @return { RequestHandler }
   *         Request Handler object
   */
  private requestHandlerBuilder(request: http.IncomingMessage, body: string): RequestHandler {
    // Parse request URL
    const parsedURL = url.parse(request.url || "", true);

    // Get the value of URL
    const pathName = parsedURL.pathname || "";

    // Sanitize URL string '/request/url/' becomes 'request/url'
    const path = pathName.replace(/^\/+|\/+$/g, "");

    // Get the value of query
    const query = parsedURL.query as UrlObject;

    // Get the value of headers from request
    const headers = request.headers as HttpHeaders;

    // Get the value of method from request
    const method = request.method as HttpMethods;

    return { path, query, headers, method, body };
  }

  /**
   * Creates an anonymous function that accepts `value` as parameters and used as `default sender` method.
   *
   * @param {http.ServerResponse} response
   *        Response object from NodeJS.
   *
   * @return { Function }
   *         Anonymous function for default sending of response.
   */
  private requestSender(response: http.ServerResponse): (value: string | number | object) => void {
    return (value: string | number | object) => {
      // SET Headers
      response.setHeader("Content-type", "application/json");
      response.setHeader("Access-Control-Allow-Origin", "*");

      // SET Status Code to HTTP 200/OK
      response.writeHead(200);

      // Define data to send on the client
      const data = JSON.stringify(value);

      // Send data to the client
      response.end(data);
    };
  }

  /**
   * A function that listen to an event when request is ended and execute an anonymous function to send a response to the client.
   *
   * @param {http.IncomingMessage} request
   *         An object that describe the request.
   *
   * @param {http.ServerResponse} response
   *        Server Response object.
   *
   * @param {string} body
   *        String of data chunks from the request data listener.
   *
   * @return {Function}
   *         Anonymous function which returns void.
   */
  private requestEndListener(request: http.IncomingMessage, response: http.ServerResponse, body: string): () => void {
    // Define a Request Handler object
    const req: RequestHandler = this.requestHandlerBuilder(request, body);

    return () => {
      try {
        // Get routes with same path and method
        this.routes[req.method]![req.path](req, response as ResponseHandler);
      } catch (error) {
        // Set status code to 500/Internal server error
        response.writeHead(500);

        // End request
        response.end();
      }
    };
  }
}

export { Router };
