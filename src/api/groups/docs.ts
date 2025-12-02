import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";
import { Schema } from "effect";

export class DocsGroup extends HttpApiGroup.make("docs")
  .add(
    HttpApiEndpoint.get("openapi", "/openapi.json").addSuccess(Schema.Unknown),
  )
  .add(HttpApiEndpoint.get("scalar", "/docs").addSuccess(Schema.String))
  .addError(
    Schema.Struct({
      _tag: Schema.Literal("HttpBodyError"),
    }),
    { status: 502 },
  ) {}
