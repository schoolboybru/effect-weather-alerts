import { Schema } from "effect";
import { HttpApiEndpoint, HttpApiGroup } from "@effect/platform";

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
