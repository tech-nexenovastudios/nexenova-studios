/**
 * Feature flags.
 *
 * Turning one off hides the feature from the UI without removing any code —
 * components, routes and data layers all stay in place, so flipping the flag
 * back is the only step needed to restore it.
 */
export const FEATURES = {
  /**
   * The devlog's homepage section. Its navigation entries are removed
   * alongside it; put them back in Navigation.tsx / Footer.tsx when re-enabling.
   *
   * The /devlog routes stay reachable by direct URL so links already shared or
   * indexed don't start 404ing.
   */
  devlog: false,
} as const
