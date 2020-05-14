import ColorConstructor from 'color';
import { Channel1, Channel255, Channel360 } from './channel';

export type Color = ColorConstructor;

export function fromRgbNumbers(r: Channel255, g: Channel255, b: Channel255): Color {
  return ColorConstructor.rgb(r, g, b);
}

export function fromRgb(rgb: Rgb): Color {
  return new ColorConstructor(rgb);
}

export function fromRgbNumber(rgb: number): Color {
  return new ColorConstructor(rgb);
}

export function fromHsl(h: Channel360, s: Channel1, l: Channel1): Color {
  return ColorConstructor.hsl(h, s * 100, l * 100);
}

export function fromString(data: string): Color | null {
  try {
    return new ColorConstructor(data);
  } catch (e) {
    return null;
  }
}

export function toHsl(color: Color): Hsl {
  const { h, s, l } = color.hsl().object();
  return {
    h,
    s: s / 100,
    l: l / 100,
  };
}

interface Hsl {
  readonly h: Channel360;
  readonly s: Channel1;
  readonly l: Channel1;
}

export function toHexString(color: Color): string {
  return color.hex();
}

export function toRgbNumber(color: Color): number {
  return color.rgbNumber();
}

export function toRgb(color: Color): Rgb {
  return color.rgb().object() as any;
}

export interface Rgb<T = Channel255> {
  readonly r: T;
  readonly g: T;
  readonly b: T;
}

export function mapRgb<T, U>({ r, g, b }: Rgb<T>, f: (x: T) => U): Rgb<U> {
  return {
    r: f(r),
    g: f(g),
    b: f(b),
  };
}

export function zipRgb<T, U>(rgb: Rgb<T>, rgb_: Rgb<T>, f: (x: T, x_: T) => U): Rgb<U> {
  return {
    r: f(rgb.r, rgb_.r),
    g: f(rgb.g, rgb_.g),
    b: f(rgb.b, rgb_.b),
  };
}

export function visiblyEqualColors(color: Color, other: Color): boolean {
  return color.rgbNumber() === other.rgbNumber();
}

export function showRgb(color: Color): string {
  return color.rgb().string();
}

export function showHsl(color: Color): string {
  return color.hsl().string();
}

export const white = new ColorConstructor('#ffffff');
export const grey = new ColorConstructor('#787878');
export const snow = new ColorConstructor('#fafafa');
export const red = new ColorConstructor('#ff0000');
export const gold = new ColorConstructor('#ffd700');
export const darkGrey = new ColorConstructor('#444444');
export const green = new ColorConstructor('#00ff00');
export const black = new ColorConstructor('#000000');
export const warning = new ColorConstructor('#f31431');
