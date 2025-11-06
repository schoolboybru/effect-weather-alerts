import * as Effect from "effect/Effect";
import { Data, pipe, Schema } from "effect";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "@effect/platform";

export class WeatherApiError extends Data.TaggedError("WeatherApiError")<{
  message: string;
}> {}

export class CityNotFoundError extends Data.TaggedError("CityNotFoundError")<{
  city: string;
}> {}

const WeatherResponseSchema = Schema.Struct({
  current_weather: Schema.Struct({
    temperature: Schema.Number,
    windspeed: Schema.Number,
    winddirection: Schema.Number,
    weathercode: Schema.Number,
    is_day: Schema.Number,
    time: Schema.String,
  }),
});

const WeatherDataSchema = Schema.Struct({
  city: Schema.String,
  temperature: Schema.Number,
  condition: Schema.String,
});

export type WeatherData = Schema.Schema.Type<typeof WeatherDataSchema>;
export type WeatherApiErrors = WeatherApiError | CityNotFoundError;

export class WeatherService extends Effect.Service<WeatherService>()(
  "WeatherService",
  {
    dependencies: [FetchHttpClient.layer],
    effect: Effect.gen(function* () {
      return {
        getWeather: (city: string) =>
          pipe(
            getCityCoords(city),
            Effect.flatMap(({ lat, lon }) =>
              pipe(fetchWeatherData(city, lat, lon)),
            ),
          ),
      };
    }),
  },
) {}

const cityCoords: Record<string, { lat: number; lon: number }> = {
  Calgary: { lat: 51.0447, lon: -114.0719 },
  Vancouver: { lat: 49.2827, lon: -123.1207 },
  Toronto: { lat: 43.6532, lon: -79.3832 },
};

const getCityCoords = (city: string) =>
  Effect.fromNullable(cityCoords[city]).pipe(
    Effect.mapError(() => new CityNotFoundError({ city })),
  );

const buildWeatherUrl = (lat: number, lon: number) =>
  `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;

const transformWeatherData = (
  city: string,
  apiResponse: unknown,
): Effect.Effect<WeatherData, WeatherApiError> =>
  Schema.decodeUnknown(WeatherResponseSchema)(apiResponse).pipe(
    Effect.map((data) => ({
      city,
      temperature: data.current_weather.temperature,
      condition: `Wind speed ${data.current_weather.windspeed} km/h`,
    })),
    Effect.mapError(
      (error) =>
        new WeatherApiError({ message: `Invalid API Response: ${error}` }),
    ),
  );

const fetchWeatherData = (city: string, lat: number, lon: number) =>
  Effect.gen(function* () {
    const client = yield* HttpClient.HttpClient;
    const url = buildWeatherUrl(lat, lon);
    const request = HttpClientRequest.get(url);
    const response = yield* client.execute(request);

    const json = yield* response.json;

    return yield* transformWeatherData(city, json);
  }).pipe(
    Effect.catchAll((error) =>
      Effect.fail(
        new WeatherApiError({
          message: `Failed to fetch weather data: ${error}`,
        }),
      ),
    ),
  );
