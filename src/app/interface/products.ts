export interface prodSubcategoryType {
  _id: string;
  name: string;
  slug: string;
  category: string;
}

export interface prodType {
  _id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  priceAfterDiscount?: number | null;
  quantity: number;
  sold: number;
  images: string[];
  imageCover: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
    image: string;
  };
  brand?: {
    _id: string;
    name: string;
    slug: string;
    image: string;
  };
  subcategory?: prodSubcategoryType[];
  ratingsAverage: number;
  ratingsQuantity: number;
  ratingsCount?: number;
}
