import {
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
} from "@effect/platform";
import { Effect, Schema } from "effect";
import { WeatherService } from "../../services/weatherApi.js";
import { LocationService } from "../../services/locationService.js";
import { Api } from "../index.js";

export class WeatherGroup extends HttpApiGroup.make("Weather").add(
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
    .addError(
      Schema.Struct({
        _tag: Schema.Literal("LocationApiError"),
        message: Schema.String,
      }),
      { status: 502 },
    )
    .prefix("/weather"),
) {}
