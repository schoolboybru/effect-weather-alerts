import { HttpApi } from "@effect/platform";
import { WeatherGroup } from "./groups/weather.js";
import { HealthGroup } from "./groups/health.js";
import { DocsGroup } from "./groups/docs.js";

export const Api = HttpApi.make("Api")
  .add(HealthGroup)
  .add(WeatherGroup)
  .add(DocsGroup);
