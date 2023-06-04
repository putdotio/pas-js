<div align="center">
  <p>
    <img src="https://static.put.io/images/putio-boncuk.png" width="72">
  </p>

  <h1>pas-js</h1>

  <p>
    JavaScript SDK for <a href="https://github.com/putdotio/pas">put.io Analytics System.</a>
  </p>

<p><a href="https://travis-ci.org/putdotio/pas-js"><img src="https://travis-ci.org/putdotio/pas-js.svg?branch=master" alt="Build Status"></a>
<a href="https://coveralls.io/github/putdotio/pas-js?branch=master"><img src="https://coveralls.io/repos/github/putdotio/pas-js/badge.svg?branch=master" alt="Coverage Status"></a>
<img src="https://img.shields.io/npm/v/@putdotio/pas-js" alt="npm (scoped)">
<img src="https://img.shields.io/bundlephobia/minzip/@putdotio/pas-js" alt="npm bundle size (scoped)">
<img src="https://img.shields.io/github/license/putdotio/pas-js" alt="GitHub"></p>
</div>

## Installation

```bash
yarn add @putdotio/pas-js

npm install @putdotio/pas-js
```

### Module

```js
import Pas from '@putdotio/pas-js'
```

### CommonJS

```js
const Pas = require('@putdotio/pas-js').default
```

## API

| Method Name  | Parameters                                                   |
| :----------- | :----------------------------------------------------------- |
| **alias**    | `({ id: string/number, hash: string })`                      |
| **identify** | `({ id: string/number, hash: string, properties?: object })` |
| **track**    | `(name: string, properties?: object)`                        |
| **pageView** | -                                                            |
