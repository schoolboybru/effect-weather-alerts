import * as Effect from "effect/Effect";
import * as Stream from "effect/Stream";
import * as Schedule from "effect/Schedule";
import { WeatherApi } from "./services/weatherApi.js";

export const weatherUpdates = (weatherApi: WeatherApi, city: string) =>
  Stream.repeat(weatherApi.getWeather(city), Schedule.fixed("5 seconds"));
