/**
 * Catalog module — validation and row ↔ domain mapping.
 * Persistence (Supabase) is in web-api.
 */

export {
  validateCardVariantPayload,
  rowToCardVariant,
  cardVariantToRow,
} from "./catalog.service";
export type { CatalogRow } from "./catalog.types";
