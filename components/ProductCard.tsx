"use client";

import Link from "next/link";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  discount_price?: number | null;
  stock_status?: string;
  description?: string;
}

export function ProductCard({ id, name, price, image_url, discount_price, stock_status }: ProductCardProps) {
  const isOutOfStock = stock_status === "out_of_stock";
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <Link href={`/products/${id}`} className="group block" prefetch={true}>
      <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-[#f3efe9] border border-gray-100 mb-5">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            loading="lazy"
            onLoad={() => setIsImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-1000 ${
              isImageLoaded 
                ? "blur-0 scale-100 group-hover:scale-105" 
                : "blur-2xl scale-125 opacity-50 grayscale"
            }`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <img src="/icons/logo.svg" alt="Little One" className="w-24 opacity-20" />
          </div>
        )}

        {discount_price && (
          <div className="absolute top-4 right-4 bg-[#D8BDA3] text-white text-xs font-bold px-3 py-1.5 rounded-full">
            تخفيض
          </div>
        )}

        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <span className="bg-white text-gray-800 text-sm font-bold px-4 py-2 rounded-full">نفذت الكمية</span>
          </div>
        )}
      </div>

      <div className="px-1 text-right">
        <h3 className="text-lg font-bold text-[#333] group-hover:text-[#537D84] transition-colors leading-tight mb-2">
          {name}
        </h3>
        <div className="flex items-center justify-end gap-2">
          {discount_price ? (
            <>
              <span className="text-lg font-bold text-[#537D84]">{discount_price} د.ل</span>
              <span className="text-sm text-gray-400 line-through">{price} د.ل</span>
            </>
          ) : (
            <span className="text-lg font-bold text-[#333]">{price} د.ل</span>
          )}
        </div>
      </div>
    </Link>
  );
}
