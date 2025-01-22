import { SiteContent } from "../types";
import Image from "next/image";

interface SitePreviewProps {
  content: SiteContent;
}

export function SitePreview({ content }: SitePreviewProps) {
  console.log("SitePreview rendering with:", {
    theme: content.theme,
    hasImages: content.images?.length > 0,
    images: content.images,
    firstImageUrl: content.images[0]?.url,
  });

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
      <div className={`h-[calc(100vh-220px)] overflow-y-auto p-8`}>
        <article
          className={`preview-content ${content.theme} prose prose-lg max-w-none transition-all duration-300`}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-8 font-heading">
            {content.heading}
          </h1>

          {content.images && content.images.length > 0 && (
            <div className="space-y-8 mb-8">
              {content.images.map((image, index) => (
                <figure
                  key={index}
                  className="rounded-xl overflow-hidden bg-gray-50 border border-gray-100"
                >
                  <div className="relative aspect-video">
                    <Image
                      src={image.url}
                      alt={image.alt || "Site image"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority={index === 0}
                    />
                  </div>
                  {image.caption && (
                    <figcaption className="text-center text-gray-600 text-sm py-3 px-4 border-t border-gray-100">
                      {image.caption}
                    </figcaption>
                  )}
                </figure>
              ))}
            </div>
          )}

          <div className="space-y-6">
            {content.paragraphs.map((paragraph, index) => (
              <p
                key={index}
                className="text-lg text-gray-700 leading-relaxed font-body"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
