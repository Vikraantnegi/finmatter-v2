/**
 * Type declaration for pdfjs-dist legacy ESM build (no official types for this subpath).
 */
declare module "pdfjs-dist/legacy/build/pdf.mjs" {
  const lib: {
    getDocument: (opts: {
      data: Uint8Array;
      password?: string;
      useSystemFonts?: boolean;
    }) => { promise: Promise<{ numPages: number; getPage: (n: number) => Promise<unknown> }> };
  };
  export default lib;
}
