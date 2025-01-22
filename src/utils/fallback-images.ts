interface FallbackImage {
  url: string;
  alt: string;
  caption: string;
}

export const fallbackImages: FallbackImage[] = [
  {
    url: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809",
    alt: "Abstract gradient waves",
    caption: "Dynamic waves of color in motion",
  },
  {
    url: "https://images.unsplash.com/photo-1557683316-973673baf926",
    alt: "Geometric patterns",
    caption: "Modern geometric design elements",
  },
  {
    url: "https://images.unsplash.com/photo-1579546929662-711aa81148cf",
    alt: "Fluid art design",
    caption: "Flowing abstract patterns",
  },
  {
    url: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d",
    alt: "Minimal shapes",
    caption: "Clean, minimal geometric composition",
  },
  {
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe",
    alt: "Digital landscape",
    caption: "Abstract digital art landscape",
  },
];

export const getRandomFallbackImage = (): FallbackImage => {
  const randomIndex = Math.floor(Math.random() * fallbackImages.length);
  return fallbackImages[randomIndex];
};
