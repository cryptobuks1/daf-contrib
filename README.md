[![uport-project](https://circleci.com/gh/uport-project/daf-contrib.svg?style=svg)](https://circleci.com/gh/uport-project/daf-contrib/tree/master)
[![codecov](https://codecov.io/gh/uport-project/daf-contrib/branch/master/graph/badge.svg)](https://codecov.io/gh/uport-project/daf-contrib)

# DID Agent Framework contributed plugins

This repository collects plugins for DAF that are not part of the core.

## Local development

DAF-contrib monorepo uses [yarn](https://yarnpkg.com/) [workspaces](https://classic.yarnpkg.com/en/docs/workspaces/)
and [lerna](https://lerna.js.org/)

Install root package dependencies

```
yarn install
```

Install all packages dependencies

```
yarn bootstrap
```

Build

```
yarn build
```

Run the tests

```
yarn test
```

```
yarn test:watch
```

## DAF cli tool

Use the local development version

```
yarn daf <command> <options>
```

Use the released version [daf-cli](packages/daf-cli)

Create identity

```
npx daf identity-manager --create
```

Create and send Verifiable Credential

```
npx daf credential --qrcode --send
```

Start GraphQL server

```
npx daf graphql --port 8899
```

More

```
npx daf --help
```
