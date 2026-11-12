declare module 'qrcode' {
  export interface QRCodeOptions {
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    margin?: number;
    scale?: number;
    width?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  export function toDataURL(
    text: string | Buffer,
    options?: QRCodeOptions,
    callback?: (error: Error | null, url: string) => void
  ): Promise<string>;

  export function toString(
    text: string | Buffer,
    options?: QRCodeOptions,
    callback?: (error: Error | null, string: string) => void
  ): Promise<string>;
}

