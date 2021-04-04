## PRE-RELEASE

- Update `package.json`, set `version` to a prerelease version, e.g. `2.0.0-rc1`, `3.1.5-rc4`, ...
- Run `npm pack` to create package
- Run `npm publish <package>.tgz --tag next` to publish the package under the `next` tag
- Run `npm install --save package@next` to install prerelease package
