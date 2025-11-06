import * as Effect from "effect/Effect";
import { WeatherService } from "./services/weatherApi.js";
import { Layer, Logger, LogLevel, Schema } from "effect";
import {
  NodeHttpClient,
  NodeHttpServer,
  NodeRuntime,
} from "@effect/platform-node";
import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpMiddleware,
  HttpServer,
} from "@effect/platform";
import { createServer } from "http";

class HealthGroup extends HttpApiGroup.make("health")
  .add(HttpApiEndpoint.get("get", "/").addSuccess(Schema.String))
  .prefix("/health") {}

class WeatherGroup extends HttpApiGroup.make("Weather").add(
  HttpApiEndpoint.get("weather", "/")
    .setUrlParams(
      Schema.Struct({
        city: Schema.String,
      }),
    )
    .addSuccess(
      Schema.Struct({
        city: Schema.String,
        temperature: Schema.Number,
        condition: Schema.String,
      }),
    )
    .addError(
      Schema.Struct({
        _tag: Schema.Literal("CityNotFoundError"),
        city: Schema.String,
      }),
      { status: 404 },
    )
    .addError(
      Schema.Struct({
        _tag: Schema.Literal("WeatherApiError"),
        message: Schema.String,
      }),
      { status: 502 },
    )
    .prefix("/weather"),
) {}

const Api = HttpApi.make("Api").add(HealthGroup).add(WeatherGroup);

const WeatherGroupLive = HttpApiBuilder.group(Api, "Weather", (handlers) =>
  Effect.gen(function* () {
    yield* Effect.logDebug("WeatherGroupLive");

    return handlers.handle("weather", ({ urlParams }) =>
      Effect.gen(function* () {
        const weatherService = yield* WeatherService;
        return yield* weatherService.getWeather(urlParams.city);
      }),
    );
  }),
);

const HealthGroupLive = HttpApiBuilder.group(Api, "health", (handlers) =>
  Effect.gen(function* () {
    yield* Effect.logDebug("HealthGroupLive");

    return handlers.handle("get", () => Effect.succeed("OK"));
  }),
);

const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(HealthGroupLive),
  Layer.provide(WeatherGroupLive),
  Layer.provide(WeatherService.Default),
  Layer.provide(NodeHttpClient.layer),
);

const HttpLive = HttpApiBuilder.serve(HttpMiddleware.logger).pipe(
  HttpServer.withLogAddress,
  Layer.provide(ApiLive),
  Layer.provide(Logger.minimumLogLevel(LogLevel.Info)),
  Layer.provide(
    NodeHttpServer.layer(createServer, {
      port: 3000,
    }),
  ),
);

NodeRuntime.runMain(Layer.launch(HttpLive));
