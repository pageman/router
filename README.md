<h1 align="center">MayaJS Router</h1>
<h3 align="center">Lightweight, unopinionated and fast NodeJS Router developed using Typescript.</h3>

## Motivation

We know that this is another **Express JS** like project. We develop **mayajs/router** not to compete but to have our own router for our other projects like [@mayajs/core](https://github.com/mayajs/maya#readme). Not having to rely to other framework is a double edge sword and we know it.

## Roadmap

You can see the detail roadmap of the roject [here.](https://github.com/mayajs/router/blob/master/ROADMAP.md) For suggestions and features you want to add just visit the issue section of this repository.

## Getting started

Before installing this package make sure to download and install Node.js 0.10 or higher.

For new project kindly initialize npm using the command below or see documentation [here](https://docs.npmjs.com/creating-a-package-json-file).

```shell
npm init
```

Installs via command-line

```shell
npm i @mayajs/router
```

## Features

- Simple interface
- Uses native Nodejs API
- Compatible with typescript
- ES6 compatible
- Super ligthweigh
- No dependencies
- Fast execution
- Easy to learn

## Quick Start

The easiest way to get started with mayajs/router is to create a simple route

```ts
import Router from "@mayajs/router";
import http from "http";

const PORT = process.env.PORT || 3000; // This is not required
const router = new Router();

// Define your routes method in this manner
router.get("path", ({ res, req, params, query, body }) => {
  res.send({ message: "Hello, World" });
});

// Pass the router and initialize it for used
http.createServer(router.init).listen(PORT, () => {
  console.log("Server listening on port", PORT, "...");
});
```

**NOTE**
You don't need to run `npm i` to used our router.

You can also chain your methods like this for easy management of routes.

```ts
router
  .get("path", ({ res, req, params, query, body }) => {
    // Do your thing here
  })
  .post("path", ({ res, req, params, query, body }) => {
    // Do your thing here
  })
  .put("path", ({ res, req, params, query, body }) => {
    // Do your thing here
  })
  .delete("path", ({ res, req, params, query, body }) => {
    // Do your thing here
  });
```

We also support `request params` like in Expressjs. The implementation is similar. Just add `:` infront of your named route and it will treated as a params.

```ts
router.get("path/:id", ({ res, req, params, query, body }) => {
  // Access id using req.params object
  req.params.id;

  // or access it using params variable
  params.id;
});
```

To get the query string you can caal the `query` object inside the request object or via function parameters.

```ts
router.get("path", ({ res, req, params, query, body }) => {
  // Access query strings using req.query object
  req.query.limit;

  // or access it using query variable
  query.limit;
});
```

If you are being overwhelmed of the parameters for your callback function you can remove them.
Params, query and body variables are also accessible inside the `req` object.

```ts
router.get("path", ({ res, req }) => {
  req.params;
  req.query;
  req.body;
});
```

### Additional Notes

The `req.body` object is already parse for `application/json, application/x-www-form-urlencoded and multipart/form-data`.
For `multipart/form-data` with files we are not yet supporting it.

## Collaborating

See collaborating guides [here.](https://github.com/mayajs/maya/edit/master/COLLABORATOR_GUIDE.md)

## People

Author and maintainer [Mac Ignacio](https://github.com/Mackignacio)

## License

[MIT](https://github.com/mayajs/router/blob/develop/LICENSE)
