export const closetTopics = [
  "tops",
  "bottoms",
  "shorts",
  "dresses",
  "outerwear",
  "sets",
  "active",
  "sleep",
  "swim",
  "shoes",
] as const;

export type ClosetTopic = (typeof closetTopics)[number];

export const clothingCategories = [
  ...closetTopics,
  "bags",
  "accessories",
  "jewelry",
  "activewear",
  "swimwear",
  "loungewear",
  "other",
] as const;

export type ClothingCategory = (typeof clothingCategories)[number];

export const clothingCategoryLabels: Record<ClothingCategory, string> = {
  tops: "Tops",
  bottoms: "Bottoms",
  shorts: "Shorts",
  dresses: "Dresses",
  outerwear: "Outerwear",
  sets: "Sets",
  active: "Active",
  sleep: "Sleep",
  swim: "Swim",
  shoes: "Shoes",
  bags: "Bags",
  accessories: "Accessories",
  jewelry: "Jewelry",
  activewear: "Active",
  swimwear: "Swim",
  loungewear: "Sleep",
  other: "Other",
};

export const clothingTags = [
  "Everyday",
  "Work",
  "Going Out",
  "Club",
  "Dinner",
  "Formal",
  "Church",
  "Date Night",
  "Comfy",
  "Basic",
  "Layering",
  "Casual",
  "Dressy",
  "Summer",
  "Winter",
] as const;

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
