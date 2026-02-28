/**
 * Type declarations for asset imports (images).
 * React Native / Metro resolve these to asset IDs (numbers).
 */
declare module "*.png" {
  const value: number;
  export default value;
}

declare module "*.jpg" {
  const value: number;
  export default value;
}

declare module "*.jpeg" {
  const value: number;
  export default value;
}

declare module "*.gif" {
  const value: number;
  export default value;
}

declare module "*.webp" {
  const value: number;
  export default value;
}
