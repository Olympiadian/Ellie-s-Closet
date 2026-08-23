export const clothingCategories = [
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
  "shoes",
  "bags",
  "accessories",
  "jewelry",
  "activewear",
  "swimwear",
  "loungewear",
  "other",
] as const;

export type ClothingCategory = (typeof clothingCategories)[number];

export type ProcessingStatus =
  | "uploading"
  | "processing"
  | "ready"
  | "needs_review"
  | "failed";

export type ClothingItem = {
  id: string;
  name: string;
  category: ClothingCategory;
  subcategory: string;
  primaryColor: string;
  season: string[];
  occasions: string[];
  tags: string[];
  favorite: boolean;
  addedAt: string;
  visual: "tee" | "pants" | "dress" | "jacket" | "shoe" | "bag" | "skirt" | "knit";
  tone: string;
};

export type Outfit = {
  id: string;
  name: string;
  occasion: string;
  itemIds: string[];
  favorite: boolean;
  createdAt: string;
};

export type ProcessingJob = {
  id: string;
  label: string;
  status: ProcessingStatus;
  detail: string;
};
