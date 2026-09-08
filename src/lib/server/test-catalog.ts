import "server-only";

import type { ItemFields } from "@/lib/wardrobe";

export type TestCatalogItem = ItemFields & { id: string; asset: string };

const item = (
  number: number,
  asset: string,
  fields: Omit<ItemFields, "details" | "issues"> & { description: string },
): TestCatalogItem => ({
  id: `10000000-0000-4000-8000-${String(number).padStart(12, "0")}`,
  asset,
  name: fields.name,
  category: fields.category,
  subcategory: fields.subcategory,
  color: fields.color,
  size: fields.size,
  fit: fields.fit,
  store: fields.store,
  cost: fields.cost,
  tags: fields.tags,
  occasions: fields.occasions,
  details: `TEST-CLOTHES — ${fields.description}`,
  issues: [],
});

export const testCatalog: TestCatalogItem[] = [
  item(1, "01-blue-pajamas.png", { name: "Blue Piped Cotton Pajama Set", category: "loungewear", subcategory: "Pajama set", color: "Pale blue", size: "S", fit: "Relaxed", store: "Eberjey", cost: 138, tags: ["pajamas", "cotton", "cozy", "matching set"], occasions: ["sleepwear", "lounge"], description: "Soft cotton button-up pajama shirt and matching shorts with white contrast piping." }),
  item(2, "02-pink-satin-pajamas.png", { name: "Blush Satin Pajama Set", category: "loungewear", subcategory: "Pajama set", color: "Blush pink", size: "M", fit: "Relaxed", store: "Nordstrom", cost: 79, tags: ["pajamas", "satin", "pink", "matching set"], occasions: ["sleepwear", "lounge", "travel"], description: "Silky blush button-up pajama top and shorts with a softly draped finish." }),
  item(3, "03-ivory-ribbed-pajamas.png", { name: "Ivory Ribbed Lounge Set", category: "loungewear", subcategory: "Pajama set", color: "Warm ivory", size: "S", fit: "Fitted top, relaxed bottom", store: "SKIMS", cost: 118, tags: ["pajamas", "ribbed", "neutral", "soft"], occasions: ["sleepwear", "lounge"], description: "Warm ivory ribbed sleep set with a fitted tank and comfortable drawstring pants." }),
  item(4, "04-sage-modal-pajamas.png", { name: "Sage Modal Pajama Set", category: "loungewear", subcategory: "Pajama set", color: "Sage green", size: "M", fit: "Easy relaxed", store: "Aerie", cost: 64.95, tags: ["pajamas", "modal", "green", "matching set"], occasions: ["sleepwear", "lounge", "weekend"], description: "Breathable sage modal long-sleeve pajama top and matching pants for year-round lounging." }),

  item(5, "05-black-tube-top.png", { name: "Black Essential Tube Top", category: "tops", subcategory: "Tube top", color: "Black", size: "S", fit: "Fitted", store: "Aritzia", cost: 38, tags: ["tube top", "black", "minimal", "going out"], occasions: ["going out", "date night", "concert"], description: "Clean strapless black tube top with a close, supportive fit." }),
  item(6, "06-ivory-square-neck-tank.png", { name: "Ivory Square-Neck Tank", category: "tops", subcategory: "Tank top", color: "Ivory", size: "S", fit: "Slim", store: "Abercrombie & Fitch", cost: 45, tags: ["tank top", "square neck", "neutral", "basic"], occasions: ["everyday", "brunch", "casual"], description: "Polished ivory square-neck tank with wide straps and a smooth fitted silhouette." }),
  item(7, "07-red-halter-top.png", { name: "Cherry Halter Going-Out Top", category: "tops", subcategory: "Halter top", color: "Cherry red", size: "S", fit: "Fitted", store: "Reformation", cost: 98, tags: ["halter", "red", "statement", "going out"], occasions: ["date night", "party", "dinner"], description: "Vibrant cherry-red halter top with a flattering open neckline and sleek finish." }),
  item(8, "08-cobalt-one-shoulder-top.png", { name: "Cobalt One-Shoulder Top", category: "tops", subcategory: "One-shoulder top", color: "Cobalt blue", size: "M", fit: "Body-skimming", store: "Zara", cost: 49.90, tags: ["one shoulder", "blue", "statement", "going out"], occasions: ["going out", "concert", "dinner"], description: "Cobalt one-shoulder top with a clean asymmetric neckline and smooth stretch fabric." }),
  item(9, "09-emerald-corset-top.png", { name: "Emerald Corset Top", category: "tops", subcategory: "Corset top", color: "Emerald green", size: "S", fit: "Structured", store: "House of CB", cost: 129, tags: ["corset", "green", "structured", "dressy"], occasions: ["date night", "party", "special occasion"], description: "Structured emerald corset top with shaped seams and a rich evening color." }),
  item(10, "10-silver-cowl-cami.png", { name: "Silver Shimmer Cowl Cami", category: "tops", subcategory: "Camisole", color: "Silver", size: "S", fit: "Draped", store: "Revolve", cost: 88, tags: ["cami", "shimmer", "silver", "going out"], occasions: ["party", "night out", "holiday"], description: "Metallic silver camisole with slim straps and a softly draped cowl neckline." }),
  item(11, "11-blush-lace-cami.png", { name: "Blush Lace-Trim Cami", category: "tops", subcategory: "Camisole", color: "Blush pink", size: "M", fit: "Slim", store: "Free People", cost: 58, tags: ["cami", "lace", "pink", "romantic"], occasions: ["date night", "brunch", "going out"], description: "Soft blush camisole finished with delicate lace trim and a feminine fitted shape." }),
  item(12, "12-chocolate-asymmetrical-top.png", { name: "Chocolate Ruched One-Shoulder Top", category: "tops", subcategory: "One-shoulder top", color: "Chocolate brown", size: "S", fit: "Fitted", store: "Aritzia", cost: 68, tags: ["one shoulder", "ruched", "brown", "going out"], occasions: ["dinner", "date night", "night out"], description: "Chocolate-brown asymmetrical top with soft ruching through the body." }),
  item(13, "13-white-ribbed-tank.png", { name: "White Cropped Rib Tank", category: "tops", subcategory: "Tank top", color: "White", size: "S", fit: "Cropped fitted", store: "Abercrombie & Fitch", cost: 35, tags: ["tank top", "ribbed", "white", "basic"], occasions: ["everyday", "casual", "weekend"], description: "Crisp white cropped tank in soft rib knit with a high scoop neckline." }),
  item(14, "14-navy-bustier-top.png", { name: "Navy Satin Bustier Top", category: "tops", subcategory: "Bustier top", color: "Navy", size: "M", fit: "Structured", store: "Anthropologie", cost: 98, tags: ["bustier", "satin", "navy", "dressy"], occasions: ["dinner", "event", "date night"], description: "Deep navy satin bustier with slim straps, shaped cups, and structured paneling." }),
  item(15, "15-lilac-mesh-top.png", { name: "Lilac Ruched Mesh Top", category: "tops", subcategory: "Long-sleeve top", color: "Lilac", size: "S", fit: "Fitted", store: "Urban Outfitters", cost: 59, tags: ["mesh", "ruched", "lilac", "going out"], occasions: ["concert", "night out", "party"], description: "Lilac long-sleeve mesh top with a lined bodice and gathered detailing." }),
  item(16, "16-leopard-tube-top.png", { name: "Leopard Print Tube Top", category: "tops", subcategory: "Tube top", color: "Tan and black leopard", size: "M", fit: "Fitted", store: "Mango", cost: 49.99, tags: ["tube top", "leopard", "print", "statement"], occasions: ["going out", "concert", "party"], description: "Fitted leopard-print tube top with a straight neckline and subtle side ruching." }),

  item(17, "17-light-straight-jeans.png", { name: "Light-Wash Straight Jeans", category: "bottoms", subcategory: "Jeans", color: "Light wash blue", size: "26", fit: "High-rise straight", store: "Levi's", cost: 98, tags: ["jeans", "denim", "light wash", "straight leg"], occasions: ["everyday", "casual", "weekend"], description: "Classic light-wash high-rise jeans with a full-length straight leg." }),
  item(18, "18-dark-wide-jeans.png", { name: "Dark Indigo Wide-Leg Jeans", category: "bottoms", subcategory: "Jeans", color: "Dark indigo", size: "27", fit: "High-rise wide leg", store: "Madewell", cost: 138, tags: ["jeans", "dark wash", "wide leg", "denim"], occasions: ["everyday", "work", "dinner"], description: "Dark-indigo high-rise jeans with a dramatic full-length wide leg." }),
  item(19, "19-black-flare-jeans.png", { name: "Black High-Rise Flare Jeans", category: "bottoms", subcategory: "Jeans", color: "Washed black", size: "26", fit: "High-rise flare", store: "Abercrombie & Fitch", cost: 90, tags: ["jeans", "black", "flare", "denim"], occasions: ["going out", "dinner", "casual"], description: "Washed-black high-rise jeans fitted through the thigh with a pronounced flare." }),
  item(20, "20-medium-mom-jeans.png", { name: "Medium-Wash Mom Jeans", category: "bottoms", subcategory: "Jeans", color: "Medium wash blue", size: "27", fit: "Relaxed mom fit", store: "Denim Forum", cost: 118, tags: ["jeans", "medium wash", "relaxed", "denim"], occasions: ["everyday", "errands", "weekend"], description: "Easy medium-wash jeans with a high rise, relaxed hip, and tapered ankle." }),

  item(21, "21-black-satin-midi-skirt.png", { name: "Black Satin Midi Skirt", category: "bottoms", subcategory: "Midi skirt", color: "Black", size: "S", fit: "Bias-cut", store: "Aritzia", cost: 98, tags: ["skirt", "satin", "black", "midi"], occasions: ["dinner", "date night", "event"], description: "Fluid black satin midi skirt cut on the bias for a soft drape." }),
  item(22, "22-denim-mini-skirt.png", { name: "Classic Denim Mini Skirt", category: "bottoms", subcategory: "Mini skirt", color: "Medium wash blue", size: "26", fit: "A-line", store: "Reformation", cost: 128, tags: ["skirt", "denim", "mini", "casual"], occasions: ["brunch", "concert", "weekend"], description: "Medium-wash denim mini skirt with a clean A-line shape and five-pocket styling." }),
  item(23, "23-ivory-tennis-skirt.png", { name: "Ivory Pleated Tennis Skirt", category: "bottoms", subcategory: "Mini skirt", color: "Ivory", size: "S", fit: "High-rise pleated", store: "Alo Yoga", cost: 78, tags: ["skirt", "pleated", "ivory", "preppy"], occasions: ["casual", "brunch", "weekend"], description: "Crisp ivory tennis skirt with even pleats and a smooth high-rise waistband." }),

  item(24, "24-forest-workout-set.png", { name: "Forest Green Legging Workout Set", category: "activewear", subcategory: "Workout set", color: "Forest green", size: "S", fit: "Supportive compression", store: "Lululemon", cost: 166, tags: ["workout set", "leggings", "sports bra", "green"], occasions: ["gym", "active", "errands"], description: "Matching forest-green sports bra and high-rise full-length performance leggings." }),
  item(25, "25-navy-black-workout-set.png", { name: "Navy and Black Short Workout Set", category: "activewear", subcategory: "Workout set", color: "Deep navy and black", size: "M", fit: "Fitted performance", store: "Alo Yoga", cost: 196, tags: ["workout set", "shorts", "jacket", "navy"], occasions: ["gym", "active", "travel"], description: "Coordinated zip-front cropped athletic jacket and high-rise fitted workout shorts." }),
];
