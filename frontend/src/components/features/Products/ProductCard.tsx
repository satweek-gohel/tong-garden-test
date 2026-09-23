import React from "react";
import { Card } from "@/components/common/Card";
import { Button } from "@/components/common/Button";
import { Product, Category } from "@/types";

interface ProductCardProps {
  product: Product;
  category?: Category;
  onEdit?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, category, onEdit }) => {
  const isLowStock = product.stock_quantity <= product.reorder_level;
  const isReorderSoon = !isLowStock && product.stock_quantity <= product.reorder_level * 2;

  const status = isLowStock
    ? { label: "Low stock", dot: "bg-danger", text: "text-danger" }
    : isReorderSoon
      ? { label: "Reorder soon", dot: "bg-accent", text: "text-accent" }
      : { label: "In stock", dot: "bg-success", text: "text-success" };

  return (
    <Card variant="outlined" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        {category && (
          <span className="bg-primary-soft text-primary text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
            {category.name}
          </span>
        )}
        <span className={`flex items-center gap-1.5 text-xs font-semibold ${status.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>
      </div>

      <div>
        <h3 className="text-[15.5px] font-semibold text-ink">{product.name}</h3>
        <p className="text-xs text-muted font-mono mt-0.5">{product.sku}</p>
      </div>

      {product.description && <p className="text-sm text-muted line-clamp-2">{product.description}</p>}

      <div className="flex justify-between items-baseline mt-1">
        <span className="font-display text-[22px] font-bold text-ink">${Number(product.price).toFixed(2)}</span>
        <span className={`text-[13px] ${isLowStock ? "text-danger font-semibold" : "text-muted"}`}>
          {product.stock_quantity} units
        </span>
      </div>

      <Button type="button" variant="outline" size="sm" className="mt-1" onClick={() => onEdit?.(product)}>
        Edit
      </Button>
    </Card>
  );
};
