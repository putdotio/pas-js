<div align="center">
  <p>
    <img src="https://static.put.io/images/putio-boncuk.png" width="72" alt="put.io boncuk">
  </p>

  <h1>pas-js</h1>

  <p>Browser analytics client for the put.io Analytics System.</p>

  <p>
    <a href="https://github.com/putdotio/pas-js/actions/workflows/ci.yml?query=branch%3Amain" style="text-decoration:none;"><img src="https://img.shields.io/github/actions/workflow/status/putdotio/pas-js/ci.yml?branch=main&style=flat&label=ci&colorA=000000&colorB=000000" alt="CI"></a>
    <a href="https://www.npmjs.com/package/@putdotio/pas-js" style="text-decoration:none;"><img src="https://img.shields.io/npm/v/%40putdotio%2Fpas-js?style=flat&colorA=000000&colorB=000000" alt="npm version"></a>
    <a href="https://github.com/putdotio/pas-js/blob/main/LICENSE" style="text-decoration:none;"><img src="https://img.shields.io/github/license/putdotio/pas-js?style=flat&colorA=000000&colorB=000000" alt="license"></a>
  </p>
</div>

## Installation

Install with npm:

```bash
npm install @putdotio/pas-js
```

## Quick Start

```ts
import createPasClient from "@putdotio/pas-js";

const pas = createPasClient();

pas.identify({
  id: "42",
  hash: "signed-user-hash",
  properties: {
    plan: "pro",
  },
});

pas.track("transfer_completed", {
  transfer_id: 123,
});
```

## Browser Tracking

The default client keeps an anonymous identifier in browser cookies and can send identity, event, and page-view payloads to PAS:

```ts
import createPasClient from "@putdotio/pas-js";

const pas = createPasClient();

pas.alias({ id: "42", hash: "signed-user-hash" });
pas.pageView();
```

## API

| Method Name  | Parameters                                                   |
| :----------- | :----------------------------------------------------------- |
| **alias**    | `({ id: string/number, hash: string })`                      |
| **identify** | `({ id: string/number, hash: string, properties?: object })` |
| **track**    | `(name: string, properties?: object)`                        |
| **pageView** | -                                                            |

## Docs

- [Security](./SECURITY.md)

## Contributing

See [Contributing](./CONTRIBUTING.md)

## License

This project is available under the [MIT License](./LICENSE)
