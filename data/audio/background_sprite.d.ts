declare module 'background_sprite.json' {
  const spriteSheet: SpriteSheet;
  export default spriteSheet;

  export interface SpriteSheet {
    resources: string[];
    spritemap: {
      [key: string]: {
        start: number;
        end: number;
        loop: boolean;
      }
    };
    trackKeys: string[];
    autoplay?: string;
  }
}
