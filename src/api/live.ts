import { Layer } from "effect";
import { HttpApiBuilder } from "@effect/platform";
import { NodeHttpClient } from "@effect/platform-node";
import { Api } from "./index.js";
import { WeatherGroupLive } from "./handlers/weather.js";
import { HealthGroupLive } from "./handlers/health.js";
import { DocsGroupLive } from "./handlers/docs.js";
import { WeatherService } from "../services/weatherApi.js";
import { LocationService } from "../services/locationService.js";
import { CacheService } from "../services/cacheService.js";

const baseServices = Layer.mergeAll(
  WeatherService.Default,
  LocationService.Default,
);

const serviceLayer = baseServices.pipe(
  Layer.provideMerge(CacheService.Default),
);

const handlerLayer = Layer.mergeAll(
  HealthGroupLive,
  WeatherGroupLive,
  DocsGroupLive,
);

export const ApiLive = HttpApiBuilder.api(Api).pipe(
  Layer.provide(handlerLayer),
  Layer.provide(serviceLayer),
  Layer.provide(NodeHttpClient.layer),
);
