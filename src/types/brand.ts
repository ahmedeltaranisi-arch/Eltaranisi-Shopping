/** نوع البراند (من API: GET /api/v1/brands و GET /api/v1/brands/:id) */

export interface brandType {
  _id: string;
  name: string;
  slug: string;
  image: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Metadata {
  currentPage: number;
  numberOfPages: number;
  limit: number;
  nextPage?: number;
}

/** شكل الـ response الكامل (wrapper) */
export interface brandsResponse {
  results: number;
  metadata: Metadata;
  data: brandType[];
}
