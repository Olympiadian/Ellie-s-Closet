import "server-only";

import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

const clothingIndexSchema = z.object({
  name: z.string().min(2).max(80),
  category: z.enum([
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
  ]),
  subcategory: z.string().min(2).max(60),
  primary_color: z.string().min(2).max(40),
  secondary_color: z.string().max(40).nullable(),
  pattern: z.string().min(2).max(40),
  material_guess: z.string().max(60).nullable(),
  seasons: z.array(z.enum(["spring", "summer", "fall", "winter"])).min(1),
  occasions: z.array(z.string().min(2).max(40)).max(8),
  style_tags: z.array(z.string().min(2).max(40)).max(12),
  confidence: z.number().min(0).max(1),
  review_reason: z.string().max(180).nullable(),
});

export type ClothingIndexResult = z.infer<typeof clothingIndexSchema>;

export async function indexClothingImage(imageUrl: string): Promise<ClothingIndexResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  const model = process.env.OPENAI_VISION_MODEL;

  if (!apiKey || !model) {
    throw new Error("OpenAI indexing environment variables are not configured.");
  }

  const openai = new OpenAI({ apiKey });
  const response = await openai.responses.parse({
    model,
    instructions:
      "Index one photographed wardrobe item. Describe only visible evidence, use concise human labels, and lower confidence when the image is unclear or shows multiple pieces.",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Return the structured wardrobe record for this clothing image.",
          },
          {
            type: "input_image",
            image_url: imageUrl,
            detail: "high",
          },
        ],
      },
    ],
    text: {
      format: zodTextFormat(clothingIndexSchema, "clothing_index"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("The clothing image could not be indexed.");
  }

  return response.output_parsed;
}
