"use client";

import { useCart } from "@/components/CartProvider";
import { useState } from "react";

interface AddToCartButtonProps {
  product: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
  };
  disabled?: boolean;
}

export function AddToCartButton({ product, disabled }: AddToCartButtonProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
          <button 
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-2 hover:bg-gray-100 transition-colors"
          >
            -
          </button>
          <span className="px-4 font-bold">{quantity}</span>
          <button 
            onClick={() => setQuantity(quantity + 1)}
            className="px-4 py-2 hover:bg-gray-100 transition-colors"
          >
            +
          </button>
        </div>
        <span className="text-gray-400 text-sm">الكمية</span>
      </div>

      <button
        onClick={handleAdd}
        disabled={disabled}
        className={`w-full py-4 rounded-full font-bold text-lg transition-all ${
          added 
            ? "bg-green-500 text-white" 
            : "bg-[#537D84] hover:bg-[#45676d] text-white shadow-lg shadow-[#537D84]/20"
        } disabled:bg-gray-300 disabled:shadow-none`}
      >
        {disabled ? "نفذت الكمية" : added ? "تمت الإضافة ✓" : "إضافة إلى السلة"}
      </button>
    </div>
  );
}
