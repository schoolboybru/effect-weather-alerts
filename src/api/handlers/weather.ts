import { HttpApiBuilder } from "@effect/platform";
import { Api } from "../index.js";
import { Effect } from "effect";
import { WeatherService } from "../../services/weatherApi.js";
import { LocationService } from "../../services/locationService.js";

export const WeatherGroupLive = HttpApiBuilder.group(
  Api,
  "Weather",
  (handlers) =>
    Effect.gen(function* () {
      yield* Effect.logDebug("WeatherGroupLive");

      return handlers.handle("weather", ({ urlParams }) =>
        Effect.gen(function* () {
          const start = Date.now();

          const weatherService = yield* WeatherService;
          const cityData = yield* LocationService;

          yield* Effect.logInfo(`Services resolved in ${Date.now() - start}ms`);
          const locationStart = Date.now();

          const cities = yield* cityData.getLocation(urlParams.city);
          yield* Effect.logInfo(
            `Location API took ${Date.now() - locationStart}ms`,
          );

          const city = cities.results[0];
          const weatherStart = Date.now();

          const result = yield* weatherService.getWeather(
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
