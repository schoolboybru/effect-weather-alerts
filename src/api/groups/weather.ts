import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";

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
