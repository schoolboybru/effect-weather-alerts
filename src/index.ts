import { Layer, Logger, LogLevel } from "effect";
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node";
import { HttpApiBuilder, HttpMiddleware, HttpServer } from "@effect/platform";
import { createServer } from "http";
import { ApiLive } from "./api/live.js";

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
