import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";

export class HealthGroup extends HttpApiGroup.make("health")
  .add(HttpApiEndpoint.get("get", "/").addSuccess(Schema.String))
  .prefix("/health") {}
