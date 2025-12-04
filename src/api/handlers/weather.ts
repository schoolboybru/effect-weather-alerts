import { Effect } from "effect";
import { HttpApiBuilder } from "@effect/platform";
import { Api } from "../index.js";
import { WeatherService } from "../../services/weatherApi.js";
import { CacheService } from "../../services/cacheService.js";

export const WeatherGroupLive = HttpApiBuilder.group(
  Api,
  "Weather",
  (handlers) =>
    Effect.gen(function* () {
      yield* Effect.logDebug("WeatherGroupLive");

      return handlers.handle("weather", ({ urlParams }) =>
        Effect.gen(function* () {
          const start = Date.now();

          yield* Effect.logInfo(`Services resolved in ${Date.now() - start}ms`);
          const locationStart = Date.now();

          const cities = yield* CacheService.getLocation(urlParams.city);
          yield* Effect.logInfo(
            `Location API took ${Date.now() - locationStart}ms`,
          );

          const city = cities.results[0];
          const weatherStart = Date.now();

          const result = yield* WeatherService.getWeather(
            city.name,
            city.latitude,
            city.longitude,
          );

          yield* Effect.logInfo(
            `Weather API took ${Date.now() - weatherStart}ms`,
          );
          yield* Effect.logInfo(`Total requet time: ${Date.now() - start}ms`);

          return result;
        }),
      );
    }),
);
