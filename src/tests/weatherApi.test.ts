import { describe, it, expect } from "vitest";
import { Duration, Effect } from "effect";
import {
  CityNotFoundError,
  WeatherApiError,
  WeatherApiLive,
  WeatherService,
} from "../services/weatherApi.js";
import { NodeHttpClient } from "@effect/platform-node";
import { HttpClient, HttpClientRequest } from "@effect/platform";

describe("WeatherApi Integration Tests ", () => {
  it("should work with real API", async () => {
    const result = await Effect.gen(function* () {
      const weatherApi = yield* WeatherService;
      return yield* weatherApi.getWeather("Calgary");
    }).pipe(
      Effect.provide(WeatherApiLive),
      Effect.provide(NodeHttpClient.layer),
      Effect.runPromise,
    );

    expect(result.city).toBe("Calgary");
    expect(typeof result.temperature).toBe("number");
    expect(result.condition).toContain("Wind speed");
  }, 2000);

  it("should fail for unsupported city", async () => {
    const result = await Effect.gen(function* () {
      const weatherApi = yield* WeatherService;
      return yield* weatherApi.getWeather("CityDoesNotExist");
    }).pipe(
      Effect.provide(WeatherApiLive),
      Effect.provide(NodeHttpClient.layer),
      Effect.flip,
      Effect.runPromise,
    );
    expect(result).toBeInstanceOf(CityNotFoundError);
  });

  it("should handle API errors from invalid coordinates", async () => {
    const testWeatherApi = {
      getWeatherByCoords: (lat: number, lon: number) =>
        Effect.gen(function* () {
          const client = yield* HttpClient.HttpClient;
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
          const request = HttpClientRequest.get(url);
          const response = yield* client.execute(request);
          const text = yield* response.text;
          const json = yield* Effect.try({
            try: () => JSON.parse(text),
            catch: (error) =>
              new WeatherApiError({ message: `Parse error: ${error}` }),
          });

          if (json.error) {
            return yield* Effect.fail(
              new WeatherApiError({ message: json.reason }),
            );
          }

          return json;
        }),
    };

    const result = await testWeatherApi
      .getWeatherByCoords(999, 999)
      .pipe(
        Effect.provide(NodeHttpClient.layer),
        Effect.flip,
        Effect.runPromise,
      );

    expect(result).toBeInstanceOf(WeatherApiError);
  });

  it("should handle network timeouts", async () => {
    const result = await Effect.gen(function* () {
      const weatherApi = yield* WeatherService;
      return yield* weatherApi.getWeather("Calgary");
    }).pipe(
      Effect.timeout(Duration.millis(1)),
      Effect.provide(WeatherApiLive),
      Effect.provide(NodeHttpClient.layer),
      Effect.flip,
      Effect.runPromise,
    );

    expect(result.message).toContain("timed out");
  }, 5000);
});
