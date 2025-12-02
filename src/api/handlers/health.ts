import { HttpApiBuilder } from "@effect/platform";
import { Effect } from "effect";
import { Api } from "../index.js";

export const HealthGroupLive = HttpApiBuilder.group(Api, "health", (handlers) =>
  Effect.gen(function* () {
    yield* Effect.logDebug("HealthGroupLive");

    return handlers.handle("get", () => Effect.succeed("OK"));
  }),
);
