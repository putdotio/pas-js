# `@putdotio/pas-js`

[![Build Status](https://travis-ci.org/putdotio/pas-js.svg?branch=master)](https://travis-ci.org/putdotio/pas-js)
[![Coverage Status](https://coveralls.io/repos/github/putdotio/pas-js/badge.svg?branch=master)](https://coveralls.io/github/putdotio/pas-js?branch=master)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Client-side JavaScript library for Put.io Analytics System

## Usage

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

```
<script src="https://unpkg.com/@putdotio/pas-js/dist/index.umd.js"></script>
```

```js
const Pas = window.Pas
```

## Methods

| Name         | Parameters      | 
| :----------- | :-------------- | 
| **alias**    | `({ id: string/number, hash: string })` |
| **identify** | `({ id: string/number, hash: string, properties: object })` |
| **track**    | `({ name: number, properties: object })` |
| **pageView** | - |
