# `@putdotio/pas-js`

[![Build Status](https://travis-ci.org/putdotio/pas-js.svg?branch=master)](https://travis-ci.org/putdotio/pas-js)
[![Coverage Status](https://coveralls.io/repos/github/putdotio/pas-js/badge.svg?branch=master)](https://coveralls.io/github/putdotio/pas-js?branch=master)
![npm (scoped)](https://img.shields.io/npm/v/@putdotio/pas-js)
![GitHub](https://img.shields.io/github/license/putdotio/pas-js)

Browser client for [Put.io Analytics System](https://github.com/putdotio/pas)

## Installation

```bash
$ npm install @putdotio/pas-js -S
```

### Module

```js
import Pas from '@putdotio/pas-js'
```

### CommonJS

```js
const PutioAPI = require('@putdotio/pas-js').default
```

### Browser

```html
<script src="https://unpkg.com/@putdotio/pas-js/dist/index.umd.js"></script>
```

```js
const Pas = window.Pas
```

## API

| Name         | Parameters                                                   |
| :----------- | :----------------------------------------------------------- |
| **alias**    | `({ id: string/number, hash: string })`                      |
| **identify** | `({ id: string/number, hash: string, properties?: object })` |
| **track**    | `(name: string, properties?: object)`                        |
| **pageView** | -                                                            |
