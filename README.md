# `@putdotio/pas-js`

[![Build Status](https://travis-ci.org/putdotio/pas-js.svg?branch=master)](https://travis-ci.org/putdotio/pas-js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Client-side JavaScript library for Put.io Analytics System

## Installing

_pas-js_ is pushed to npm on each tagged build, so you can easily include it by inserting a script tag into your <HEAD> part of the HTML page, like this:

```HTML
<html>
    <head>
        ...
        <script src="https://unpkg.com/@putdotio/pas-js/dist/index.umd.js"></script>
    </head>
    ...
</html>
```

## Usage

After the _pas-js_ script is loaded there will be a global variable called _Pas_, which is an instance of our primary class and will be used for communicating your server, sending events and identifying users.

### Setup

You **must** configure the _Pas_ instance by using the following method and parameters before iniating your flow:

```JS
window.Pas.setup({
  apiURL: 'api.myPasServer.com', // URL of Pas server (String, required)
  debug: false, // used for enabling debug mode, (Bool, non-required, false by default)
})
```
