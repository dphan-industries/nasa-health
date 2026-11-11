import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export let WIDTH = width;
export let HEIGHT = height;
export let CENTER_X = width / 2;
export let CENTER_Y = height / 2;

// Arena sizing
export const MOON_RADIUS = 90;
export const MOON_SIZE = 45;
export const EARTH_SIZE = 90;
export const MAX_ORBIT_RADIUS = MOON_RADIUS * 1.8;
export let SPAWN_DIST = Math.max(600, Math.hypot(width, height) / 2 + 100);
Dimensions.addEventListener("change", ({ window }) => {
  WIDTH = window.width;
  HEIGHT = window.height;
  CENTER_X = WIDTH / 2;
  CENTER_Y = HEIGHT / 2;
  SPAWN_DIST = Math.max(600, Math.hypot(WIDTH, HEIGHT) / 2 + 100);
});

// Visuals / economy
export const NUM_STARS = 80;
export const COINS_PER_BLOCK = 1;

// Spawn tuning
export const BASE_SPAWN_RATE = 1200;
export const MIN_SPAWN_RATE = 900;
export const SPAWN_RATE_STEP_AMOUNT = 25;

// Speed tuning
export const BASE_ASTEROID_SPEED = 2.1;
export const SPEED_STEP_EVERY_SCORE = 12;
export const SPEED_STEP_AMOUNT = 0.1;
export const MAX_SPEED_MULTIPLIER = 2.8;
