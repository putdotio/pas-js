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

The client keeps an anonymous identifier in a browser cookie and sends
identity, event, and page-view payloads to PAS:

```ts
import createPasClient from "@putdotio/pas-js";

const pas = createPasClient();

pas.alias({ id: "42", hash: "signed-user-hash" });
pas.pageView();
```

`pageView` sends the page's origin and path, its `utm_source`, `utm_medium`,
and `utm_campaign` values, and only the origin of the referrer. Nothing else
from either URL is sent, so search terms in them stay out of PAS. When the path
itself carries something PAS must not store, such as a username or an invite
code, pass the path to send instead:

```ts
pas.pageView({ path: "/files/user/FILTERED" });
```

Requests queued for retry are stored in a cookie and replayed on the next
initialization. The queue keeps at most the 20 most recent requests within
3000 bytes of percent-encoded JSON: a request too large on its own is
discarded, and the oldest are dropped when either bound is reached. Malformed
queue entries are discarded on initialization.

## API

| Method Name  | Parameters                                                   |
| :----------- | :----------------------------------------------------------- |
| **alias**    | `({ id: string/number, hash: string })`                      |
| **identify** | `({ id: string/number, hash: string, properties?: object })` |
| **track**    | `(name: string, properties?: object)`                        |
| **pageView** | `({ path?: string })`                                        |

## Docs

- [Contributing](./CONTRIBUTING.md)
- [Distribution](./docs/DISTRIBUTION.md)
- [Security policy](https://github.com/putdotio/.github/blob/main/SECURITY.md)

## License

This project is available under the [MIT License](./LICENSE)
