"use client";

import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

interface ProductDescriptionProps {
  description: string | null | undefined;
}

export default function ProductDescription({ description }: ProductDescriptionProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined" && description) {
      // HTML'i DOMParser ile parse et
      const doc = new DOMParser().parseFromString(description, "text/html");

      // Tüm iframe'leri kontrol et
      doc.querySelectorAll("iframe").forEach(iframe => {
        const src = iframe.getAttribute("src") || "";
        // Sadece YouTube embed linklerini bırak, diğerlerini kaldır
        if (!src.startsWith("https://www.youtube.com/embed/")) {
          iframe.remove();
        }
      });

      // DOMPurify ile sanitize et
      const sanitized = DOMPurify.sanitize(doc.body.innerHTML, {
        ADD_TAGS: ['iframe'],
        ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'scrolling', 'style', 'src']
      });

      setSanitizedHtml(sanitized);
    }
  }, [description]);
  

  if (!sanitizedHtml) {
    return (
      <p className="text-gray-700 leading-relaxed text-sm md:text-base">
        {description || "Bu ürün için açıklama bulunmamaktadır."}
      </p>
    );
  }

  return (
    <div
      className="text-gray-700 leading-relaxed text-sm md:text-base"
      dangerouslySetInnerHTML={{
        __html: sanitizedHtml,
      }}
    />
  );
}

