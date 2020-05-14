export function getPerspective(z: number): number {
  return Math.max(focalLength / (focalLength + z), 0);
}

export function projectToPerspective(perspective: number, x: number, vanishingX: number): number {
  return (x - vanishingX) * perspective + vanishingX;
}

export const focalLength = 10;
