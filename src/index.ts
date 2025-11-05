import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import { WeatherApiLive, WeatherService } from "./services/weatherApi.js";
import { Console, pipe, Schedule } from "effect";
import { NodeHttpClient } from "@effect/platform-node";

const program = Effect.gen(function* () {
  const weatherApi = yield* WeatherService;
  const updateStream = Stream.repeat(
    weatherApi.getWeather("Calgary"),
    Schedule.fixed("2 seconds"),
  );

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
