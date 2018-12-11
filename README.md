# pas-js

[![Build Status](https://travis-ci.org/putdotio/pas-js.svg?branch=master)](https://travis-ci.org/putdotio/pas-js)

Client-side JavaScript library for Put.io Analytics System

## Installing
*pas-js* is pushed to npm on each tagged build, so you can easily include it by inserting a script tag into your <HEAD> part of the HTML page, like this:

```HTML
<html>
    <head>
        ...
        <script src="https://unpkg.com/@putdotio/pas-js/dist/umd.js"></script>
    </head>
    ...
</html>
```

## Usage
After the *pas-js* script is loaded there will be a global variable called *Pas*, which is an instance of our primary class and will be used for communicating your server, sending events and identifying users.

### Setting up
You **must** configure the *Pas* instance by using the following method and parameters before iniating your flow:
```JS
window.Pas.setup({
  apiURL: 'api.myPasServer.com', // URL of Pas server (String, required)
  debug: false, // used for enabling debug mode, (Bool, non-required, false by default)
})
