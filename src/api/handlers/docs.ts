import { HttpApiBuilder, HttpServerResponse, OpenApi } from "@effect/platform";
import { Effect } from "effect";
import { Api } from "../index.js";

export const DocsGroupLive = HttpApiBuilder.group(Api, "docs", (handlers) =>
  Effect.gen(function* () {
    yield* Effect.logDebug("DocsGroupLive");
    return handlers
      .handle("openapi", () =>
        Effect.gen(function* () {
          const spec = OpenApi.fromApi(Api);
          return yield* HttpServerResponse.json(spec);
        }),
      )
      .handle("scalar", () =>
        Effect.gen(function* () {
          return yield* HttpServerResponse.html(`
<!DOCTYPE html>
<html>
  <head>
    <title>Weather API Documentation</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script
      id="api-reference"
      data-url="/openapi.json"
    ></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>
          `);
        }),
      );
  }),
);
