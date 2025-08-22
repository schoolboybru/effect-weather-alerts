import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { WeatherApiLive, WeatherApiTag } from "./services/weatherApi.js";
import { weatherUpdates } from "./weatherStream.js";
import { Console, pipe } from "effect";
import { NodeHttpClient } from "@effect/platform-node";

const program = Effect.gen(function* () {
  const weatherApi = yield* WeatherApiTag;
  const updateStream = weatherUpdates(weatherApi, "Calgary");

  yield* Stream.runForEach(updateStream, (weather) =>
    Console.log(
      `Weather update: ${weather.city} - ${weather.temperature}, ${weather.condition}`,
    ),
  );
});

const main = pipe(
  program,
  Effect.provide(WeatherApiLive),
  Effect.provide(NodeHttpClient.layer),
  Effect.catchAllCause(Effect.logError),
);

Effect.runPromise(main).catch(console.error);
