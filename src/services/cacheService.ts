import { Cache, Duration, Effect } from "effect";
import { LocationService, type LocationData } from "./locationService.js";

export class CacheService extends Effect.Service<CacheService>()(
  "CacheService",
  {
    accessors: true,
    dependencies: [LocationService.Default],
    effect: Effect.gen(function* () {
      const cache = yield* Cache.make({
        capacity: 1000,
        timeToLive: Duration.days(30),
        lookup: (city: string) => LocationService.getLocation(city),
      });

      return {
        getLocation: (city: string) => cache.get(city),
        invalidate: (city: string) => cache.invalidate(city),
        clear: () => cache.invalidateAll,
      };
    }),
  },
) {}
