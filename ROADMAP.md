## v0.3.0

- [ ] route params validation
- [ ] blocking of specific routes
- [ ] 'multipart/form-data' for files

## v0.2.0 - _(**7/19/2020**)_

- **ROUTER CLASS**
- [x] router.use()
- [x] router.onError() // Handles uncaugth error
- **ADDITIONAL FUNCTIONALITY**
- [x] middlewares
- [x] `next` function
- [x] cors library implementation

## v0.1.0 - _(**6/28/2020**)_

- **REQUEST HANDLERS**
  - [x] GET
  - [x] POST
  - [x] DELETE
  - [x] PUT
  - [x] PATCH
  - [x] OPTIONS
- **ROUTER CLASS**
  - [x] router.add()
  - [x] router.get()
  - [x] router.post()
  - [x] router.delete()
  - [x] router.put()
  - [x] router.patch()
  - [x] router.option()
- **RESPONSE OBJECT**
  - [x] res.setHeader()
  - [x] res.send()
  - [x] res.json()
  - [x] res.html()
  - [x] res.text()
- **REQUEST OBJECT**
  - [x] req.body // 'multipart/form-data' with files not support yet
  - [x] req.params
  - [x] req.query
  - [x] req.headers
  - [x] req.params[key]
  - [x] req.query[key]
- **ADDITIONAL FUNCTIONALITY**
  - [x] body-parser
  - [x] url-parser
  - [x] method chaining for router class
  - [x] request params
