import { Data, Effect, Schema } from "effect";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "@effect/platform";

export class LocationApiError extends Data.TaggedError("LocationApiError")<{
  message: string;
}> {}

const LocationResponseData = Schema.Struct({
  latitude: Schema.Number,
  longitude: Schema.Number,
  name: Schema.String,
  country: Schema.String,
});

const LocationResponseSchema = Schema.Struct({
  results: Schema.Array(LocationResponseData),
});

export type LocationData = Schema.Schema.Type<typeof LocationResponseSchema>;

export class LocationService extends Effect.Service<LocationService>()(
  "LocationService",
  {
    accessors: true,
    dependencies: [FetchHttpClient.layer],
    effect: Effect.gen(function* () {
      return {
        getLocation: (city: string) =>
          Effect.gen(function* () {
            const client = yield* HttpClient.HttpClient;
            const url = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=${10}`;
            const request = HttpClientRequest.get(url);
            const response = yield* client.execute(request);
            const json = yield* response.json;

            return yield* transformLocationData(json);
          }).pipe(
            Effect.catchTags({
              RequestError: (error) =>
                Effect.fail(
                  new LocationApiError({
                    message: `Failed to fetch location data: ${error.reason}`,
                  }),
                ),
              ResponseError: (error) =>
                Effect.fail(
                  new LocationApiError({
                    message: `Location API returned error: ${error.response.status}`,
                  }),
                ),
            }),
          ),
      };
    }),
  },
) {}

const transformLocationData = (
  apiResponse: unknown,
): Effect.Effect<LocationData, LocationApiError> =>
  Schema.decodeUnknown(LocationResponseSchema)(apiResponse).pipe(
    Effect.mapError(
      (error) =>
        new LocationApiError({ message: `Invalid API Response: ${error}` }),
    ),
  );
