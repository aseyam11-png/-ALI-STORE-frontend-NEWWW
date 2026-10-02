export interface VisualSearchResult {
  id: string;
  productId: string;
  productName: string;
  image?: string;
  similarity: number;
  price: number;
  brand: string;
  category: string;
}

export interface VisualSearchState {
  imageUrl?: string;

  fileName?: string;

  isSearching: boolean;

  results: VisualSearchResult[];

  error?: string;
}