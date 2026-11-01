/**
 * @file scene-director.js
 * SceneDirector — Phase 5B Presentation & Transition Orchestrator (P5B-01).
 *
 * Coordinates physical-feeling presentation scene transitions across the game:
 * MENU → DAY_BRIEF → SHIFT_START → CASE_INTAKE → CASE_REVIEW →
 * CASE_RESOLVE → NEXT_CASE → DAY_SUMMARY → NEXT_DAY → VERDICT.
 *
 * Architecture rule:
 * SceneDirector is purely a presentation coordinator. It does NOT own or
 * calculate gameplay state, emission rates, quotas, metrics, or outcomes.
 * The backend remains authoritative.
 */

/**
 * Standard scene identifier names across the campaign presentation.
 * @readonly
 * @enum {string}
 */
export const SCENE_NAMES = Object.freeze({
  MENU: 'MENU',
  DAY_BRIEF: 'DAY_BRIEF',
  SHIFT_START: 'SHIFT_START',
  CASE_INTAKE: 'CASE_INTAKE',
  CASE_REVIEW: 'CASE_REVIEW',
  CASE_RESOLVE: 'CASE_RESOLVE',
  NEXT_CASE: 'NEXT_CASE',
  DAY_SUMMARY: 'DAY_SUMMARY',
  NEXT_DAY: 'NEXT_DAY',
  VERDICT: 'VERDICT',
});

/**
 * Default duration in milliseconds for each scene transition.
 * Configurable via SceneDirector options or setTransitionDuration().
 * @type {Readonly<Record<string, number>>}
 */
export const DEFAULT_TRANSITION_DURATIONS = Object.freeze({
  MENU: 350,
  DAY_BRIEF: 400,
  SHIFT_START: 300,
  CASE_INTAKE: 750, // P5B-04: 0.6–0.9s physical delivery
  CASE_REVIEW: 0,
  CASE_RESOLVE: 700, // P5B-05: resolution exit physics
  NEXT_CASE: 250,
  DAY_SUMMARY: 400,
  NEXT_DAY: 350,
  VERDICT: 500,
});

/**
 * @typedef {Object} SceneHandler
 * @property {(data: any, context: SceneContext) => Promise<void>|void} [enter] Called when entering the scene.
 * @property {(data: any, context: SceneContext) => Promise<void>|void} [exit] Called when leaving the scene.
 * @property {() => void} [skip] Called to immediately snap visual state if skipped.
 * @property {number} [duration] Optional duration override for this scene.
 */

/**
 * @typedef {Object} SceneContext
 * @property {string} from Previous scene name.
 * @property {string} to Target scene name.
 * @property {any} data Associated transition data payload.
 * @property {boolean} reducedMotion Whether reduced-motion is active.
 * @property {number} duration Transition duration in milliseconds.
 */

/**
 * @typedef {Object} SceneDirectorOptions
 * @property {HTMLElement|Document} [root=document] DOM root element.
 * @property {string} [initialScene=SCENE_NAMES.MENU] Starting scene.
 * @property {Partial<Record<string, number>>} [durations] Custom duration overrides.
 * @property {boolean} [reducedMotion] Force reduced-motion mode (otherwise auto-detected).
 */

/**
 * SceneDirector coordinates all frontend scene presentations and transitions.
 */
export class SceneDirector {
  /**
   * @param {SceneDirectorOptions} [options]
   */
  constructor(options = {}) {
    this.root = options.root || (typeof document !== 'undefined' ? document : null);

    /** @type {string} Current active scene name. */
    this._currentScene = options.initialScene || SCENE_NAMES.MENU;

    /** @type {Record<string, number>} */
    this._durations = {
      ...DEFAULT_TRANSITION_DURATIONS,
      ...(options.durations || {}),
    };

    /** @type {Map<string, SceneHandler>} Registered scene handlers. */
    this._handlers = new Map();

    /** @type {Map<string, Set<Function>>} Event listeners. */
    this._listeners = new Map();

    /** @type {boolean} True while a transition is actively animating. */
    this._isTransitioning = false;

    /** @type {(() => void)|null} Cancellation/skip resolver for current active transition. */
    this._currentSkipFn = null;

    /** @type {number|null} Fallback timeout handle. */
    this._fallbackTimeout = null;

    /** @type {boolean} */
    this._reducedMotion = options.reducedMotion ?? this._detectReducedMotion();

    this._setupReducedMotionListener();
    this._applySceneAttribute(this._currentScene);
  }

  // ─── Reduced Motion ────────────────────────────────────────────────────────

  _detectReducedMotion() {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      try {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      } catch (_) {
        return false;
      }
    }
    return false;
  }

  _setupReducedMotionListener() {
    if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      try {
        const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mql && typeof mql.addEventListener === 'function') {
          mql.addEventListener('change', (e) => {
            this._reducedMotion = e.matches;
            this.emit('reducedMotionChange', { reducedMotion: e.matches });
          });
        }
      } catch (_) {
        // Ignored in test/headless environments
      }
    }
  }

  /**
   * Enables or disables reduced-motion mode.
   * When enabled, transitions complete virtually instantaneously without physical physics.
   *
   * @param {boolean} enabled
   */
  setReducedMotion(enabled) {
    this._reducedMotion = Boolean(enabled);
    this.emit('reducedMotionChange', { reducedMotion: this._reducedMotion });
  }

  /**
   * Returns whether reduced-motion is currently active.
   *
   * @returns {boolean}
   */
  isReducedMotion() {
    return this._reducedMotion;
  }

  // ─── Configuration & Registration ──────────────────────────────────────────

  /**
   * Registers a scene with enter/exit/skip lifecycle hooks.
   *
   * @param {string} sceneName Scene name from SCENE_NAMES or custom string.
   * @param {SceneHandler} handler Scene lifecycle handler.
   */
  registerScene(sceneName, handler) {
    if (!sceneName) return;
    this._handlers.set(sceneName, handler || {});
  }

  /**
   * Sets the configured transition duration for a scene in milliseconds.
   *
   * @param {string} sceneName
   * @param {number} durationMs
   */
  setTransitionDuration(sceneName, durationMs) {
    if (sceneName && typeof durationMs === 'number' && durationMs >= 0) {
      this._durations[sceneName] = durationMs;
    }
  }

  /**
   * Gets the transition duration for a scene, factoring in reduced motion.
   *
   * @param {string} sceneName
   * @returns {number}
   */
  getTransitionDuration(sceneName) {
    if (this._reducedMotion) {
      return 0;
    }
    const handler = this._handlers.get(sceneName);
    if (handler && typeof handler.duration === 'number') {
      return handler.duration;
    }
    return this._durations[sceneName] ?? 200;
  }

  /**
   * Returns the currently active scene identifier.
   *
   * @returns {string}
   */
  getCurrentScene() {
    return this._currentScene;
  }

  /**
   * Returns true if a transition is currently in progress.
   *
   * @returns {boolean}
   */
  isTransitioning() {
    return this._isTransitioning;
  }

  // ─── Event Bus ─────────────────────────────────────────────────────────────

  /**
   * Subscribes to SceneDirector events.
   *
   * @param {string} event
   * @param {Function} callback
   * @returns {() => void} Unsubscribe function.
   */
  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribes from an event.
   *
   * @param {string} event
   * @param {Function} callback
   */
  off(event, callback) {
    const set = this._listeners.get(event);
    if (set) {
      set.delete(callback);
    }
  }

  /**
   * Emits an event to registered listeners.
   *
   * @param {string} event
   * @param {any} payload
   */
  emit(event, payload) {
    const set = this._listeners.get(event);
    if (set) {
      for (const cb of set) {
        try {
          cb(payload);
        } catch (err) {
          console.warn(`[SceneDirector] Error in listener for "${event}":`, err);
        }
      }
    }
  }

  // ─── Scene Transition Orchestration ────────────────────────────────────────

  /**
   * Immediately skips the active transition if one is in flight, snapping to final state.
   */
  skipTransition() {
    if (this._isTransitioning && typeof this._currentSkipFn === 'function') {
      const skipFn = this._currentSkipFn;
      this._currentSkipFn = null;
      skipFn();
    }
  }

  /**
   * Executes a coordinated scene transition to the target scene.
   *
   * @param {string} targetScene Identifier of the scene to transition to.
   * @param {any} [data={}] Associated data payload (case, day info, result, etc.).
   * @param {Object} [options]
   * @param {boolean} [options.force=false] If true, cancels any running transition and immediately starts this one.
   * @returns {Promise<{ from: string, to: string, data: any }>}
   */
  async transitionTo(targetScene, data = {}, options = {}) {
    if (!targetScene) {
      return { from: this._currentScene, to: this._currentScene, data };
    }

    // Handle conflicting simultaneous transitions safely
    if (this._isTransitioning) {
      if (options.force) {
        this.skipTransition();
      } else {
        // Complete the current in-flight transition immediately to avoid deadlock
        this.skipTransition();
      }
    }

    const fromScene = this._currentScene;
    const duration = this.getTransitionDuration(targetScene);
    const context = {
      from: fromScene,
      to: targetScene,
      data,
      reducedMotion: this._reducedMotion,
      duration,
    };

    this._isTransitioning = true;
    this.emit('transitionStart', context);

    // Call exit hook on previous scene
    const previousHandler = this._handlers.get(fromScene);
    if (previousHandler && typeof previousHandler.exit === 'function') {
      try {
        await Promise.resolve(previousHandler.exit(data, context));
      } catch (err) {
        console.warn(`[SceneDirector] Exit hook error for ${fromScene}:`, err);
      }
    }

    // Update active scene tracking and DOM reflection
    this._currentScene = targetScene;
    this._applySceneAttribute(targetScene);

    // Call enter hook on new scene
    const targetHandler = this._handlers.get(targetScene);

    return new Promise((resolve) => {
      let isSettled = false;

      const finish = () => {
        if (isSettled) return;
        isSettled = true;

        if (this._fallbackTimeout !== null) {
          clearTimeout(this._fallbackTimeout);
          this._fallbackTimeout = null;
        }

        this._isTransitioning = false;
        this._currentSkipFn = null;

        this.emit('transitionEnd', context);
        this.emit('sceneChange', context);
        resolve({ from: fromScene, to: targetScene, data });
      };

      // Register skip handler
      this._currentSkipFn = () => {
        if (targetHandler && typeof targetHandler.skip === 'function') {
          try {
            targetHandler.skip();
          } catch (_) { /* ignore */ }
        }
        this.emit('transitionSkipped', context);
        finish();
      };

      // If duration is 0 (reduced motion or instant scene), complete immediately
      if (duration === 0) {
        if (targetHandler && typeof targetHandler.enter === 'function') {
          try {
            targetHandler.enter(data, context);
          } catch (err) {
            console.warn(`[SceneDirector] Enter hook error for ${targetScene}:`, err);
          }
        }
        finish();
        return;
      }

      // Execute enter hook
      try {
        if (targetHandler && typeof targetHandler.enter === 'function') {
          const enterRes = targetHandler.enter(data, context);
          if (enterRes && typeof enterRes.then === 'function') {
            enterRes.then(() => finish()).catch(() => finish());
          }
        }
      } catch (err) {
        console.warn(`[SceneDirector] Enter hook error for ${targetScene}:`, err);
      }

      // Safe fallback timer guarantees input never locks even if DOM animation events fail
      const fallbackMs = Math.max(duration + 60, 100);
      this._fallbackTimeout = setTimeout(finish, fallbackMs);
    });
  }

  _applySceneAttribute(sceneName) {
    if (this.root && typeof this.root.setAttribute === 'function') {
      this.root.setAttribute('data-active-scene', sceneName);
    }
  }

  /**
   * Destroys the SceneDirector, clearing timeouts and listeners.
   */
  destroy() {
    if (this._fallbackTimeout !== null) {
      clearTimeout(this._fallbackTimeout);
      this._fallbackTimeout = null;
    }
    this._listeners.clear();
    this._handlers.clear();
    this._isTransitioning = false;
    this._currentSkipFn = null;
  }
}

/**
 * Factory for SceneDirector.
 *
 * @param {SceneDirectorOptions} [options]
 * @returns {SceneDirector}
 */
export function createSceneDirector(options = {}) {
  return new SceneDirector(options);
}

