import { HttpApiBuilder } from "@effect/platform";
import { Layer } from "effect";
import { Api } from "./index.js";
import { WeatherGroupLive } from "./handlers/weather.js";
import { HealthGroupLive } from "./handlers/health.js";
import { DocsGroupLive } from "./handlers/docs.js";
import { WeatherService } from "../services/weatherApi.js";
import { LocationService } from "../services/locationService.js";
import { NodeHttpClient } from "@effect/platform-node";

const serviceLayer = Layer.merge(
  WeatherService.Default,
  LocationService.Default,
);

export const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(HealthGroupLive),
  Layer.provide(WeatherGroupLive),
  Layer.provide(DocsGroupLive),
  Layer.provide(serviceLayer),
  Layer.provide(NodeHttpClient.layer),
);
