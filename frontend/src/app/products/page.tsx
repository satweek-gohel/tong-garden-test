"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { useDebounce } from "@/hooks/useDebounce";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { ProductCard } from "@/components/features/Products/ProductCard";
import { ProductFormModal } from "@/components/features/Products/ProductFormModal";
import { CategoryFormModal } from "@/components/features/Products/CategoryFormModal";
import { Button } from "@/components/common/Button";
import { Loader } from "@/components/common/Loader";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SearchIcon, PlusIcon } from "@/components/icons";
import { Product } from "@/types";
import clsx from "clsx";

export default function ProductsPage() {
  return (
    <DashboardLayout>
      <ProductsContent />
    </DashboardLayout>
  );
}

function ProductsContent() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const debouncedSearch = useDebounce(search, 400);

  const { data: categories, refetch: refetchCategories } = useApi(() => categoryService.getAll(), []);

  const {
    data: products,
    loading,
    error,
    refetch,
  } = useApi(
    () => (debouncedSearch ? productService.search(debouncedSearch) : productService.getAll(0, 50, categoryId ?? undefined)),
    [debouncedSearch, categoryId]
  );

  const categoryById = new Map((categories ?? []).map((c) => [c.id, c]));

  const openCreateModal = () => {
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setModalOpen(true);
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-[26px] font-semibold text-ink">Products</h1>
          <p className="text-sm text-muted mt-1.5">{products?.length ?? 0} SKUs shown</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface border border-line rounded-[10px] px-3.5 py-2.5 w-60">
            <SearchIcon width={16} height={16} className="text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-none outline-none text-sm bg-transparent w-full font-sans"
            />
          </div>
          <Button type="button" onClick={openCreateModal}>
            <PlusIcon width={16} height={16} strokeWidth={2.2} />
            New product
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        {categories && categories.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => setCategoryId(null)}
              className={clsx(
                "px-4 py-2 rounded-full text-[13px] font-semibold transition-colors",
                categoryId === null ? "bg-primary text-[#F5F3EE]" : "bg-surface border border-line text-ink hover:border-ink/30"
              )}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategoryId(c.id)}
                className={clsx(
                  "px-4 py-2 rounded-full text-[13px] font-semibold transition-colors",
                  categoryId === c.id ? "bg-primary text-[#F5F3EE]" : "bg-surface border border-line text-ink hover:border-ink/30"
                )}
              >
                {c.name}
              </button>
            ))}
          </>
        )}
        <button
          type="button"
          onClick={() => setCategoryModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold text-primary border border-dashed border-primary/40 hover:bg-primary-soft transition-colors"
        >
          <PlusIcon width={13} height={13} strokeWidth={2.4} />
          New category
        </button>
      </div>

      {categories && categories.length === 0 && (
        <p className="text-sm text-muted -mt-3">
          No categories yet — every product needs one, so create your first category above before adding products.
        </p>
      )}

      {loading && <Loader label="Loading products..." />}
      {error && <p className="text-danger text-sm">Failed to load products: {error.message}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products?.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              category={categoryById.get(product.category_id)}
              onEdit={openEditModal}
            />
          ))}
          {products?.length === 0 && <p className="text-muted text-sm">No products found.</p>}
        </div>
      )}

      <ProductFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={refetch}
        categories={categories ?? []}
        product={editingProduct}
      />

      <CategoryFormModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        onSaved={refetchCategories}
      />
    </>
  );
}
