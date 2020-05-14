export interface TextStyleProperties {
  align?: string;
  breakWords?: boolean;
  dropShadow?: boolean;
  dropShadowAlpha?: number;
  dropShadowAngle?: number;
  dropShadowBlur?: number;
  dropShadowColor?: string | number;
  dropShadowDistance?: number;
  fill?: string | string[] | number | number[] | CanvasGradient | CanvasPattern;
  fillGradientType?: number;
  fillGradientStops?: number[];
  fontFamily?: string | string[];
  fontSize?: number | string;
  fontStyle?: FontStyle;
  fontVariant?: string;
  fontWeight?: string;
  leading?: number;
  letterSpacing?: number;
  lineHeight?: number;
  lineJoin?: string;
  miterLimit?: number;
  padding?: number;
  stroke?: string | number;
  strokeThickness?: number;
  trim?: boolean;
  textBaseline?: string;
  whiteSpace?: string;
  wordWrap?: boolean;
  wordWrapWidth?: number;
}

export type FontStyle = 'normal' | 'italic' | 'oblique';

export type FontWeight =
  | 'normal'
  | 'bold'
  | 'bolder'
  | 'lighter'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900';

export type PointLike = [number, number] | number;
