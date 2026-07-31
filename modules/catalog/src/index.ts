export interface CatalogReader {
  isActiveCategory(categoryId: string): Promise<boolean>;
}

export const catalogModule = { name: "catalog" } as const;
