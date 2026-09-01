```ts
// src/types/hotShot.ts

export type HotShotFeature = {
  title: string;
  description: string;
  icon: string;
};

export type HotShotStat = {
  value: string;
  label: string;
};

/**
 * Hot Shot equipment / service option
 */
export type HotShotOption = {
  title: string;
  label: string;
  description: string;
  icon: string;
};

export type HotShotService = {
  /**
   * Unique service slug
   */
  slug: string;

  /**
   * Service number
   */
  number: string;

  /**
   * Main service title
   */
  title: string;

  /**
   * Hero badge
   */
  badge: string;

  /**
   * Hero / service image
   */
  image: string;

  /**
   * Short service description
   */
  shortDescription: string;

  /**
   * Full service description paragraphs
   */
  description: string[];

  /**
   * Service features
   */
  features: HotShotFeature[];

  /**
   * Service statistics
   */
  stats: HotShotStat[];

  /**
   * Equipment / transportation options
   *
   * For Hot Shot these include:
   * - Truck & Trailers
   * - Sprinter Van with Lifters
   * - 16 Feet Enclosed Trailer
   * - 24 Feet Enclosed Trailer
   * - 40 Feet Flat Bed
   * - 20 Feet Flat Bed
   */
  options: HotShotOption[];
};
```
