"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { TextInput } from "@/components/forms/TextInput";
import { SelectInput } from "@/components/forms/SelectInput";
import { productService } from "@/services/productService";
import { Category, Product } from "@/types";

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  categories: Category[];
  product?: Product | null;
}

const emptyForm = {
  sku: "",
  name: "",
  description: "",
  price: "",
  cost: "",
  stock_quantity: "",
  category_id: "",
  manufacturer: "",
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSaved, categories, product }) => {
  const isEditing = !!product;
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        sku: product.sku,
        name: product.name,
        description: product.description ?? "",
        price: String(product.price),
        cost: product.cost != null ? String(product.cost) : "",
        stock_quantity: String(product.stock_quantity),
        category_id: String(product.category_id),
        manufacturer: product.manufacturer ?? "",
      });
    } else {
      setForm(emptyForm);
    }
    setError(null);
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      if (isEditing && product) {
        await productService.update(product.id, {
          name: form.name,
          description: form.description || undefined,
          price: Number(form.price),
          cost: form.cost ? Number(form.cost) : undefined,
          stock_quantity: Number(form.stock_quantity),
          category_id: Number(form.category_id),
        });
      } else {
        await productService.create({
          sku: form.sku,
          name: form.name,
          description: form.description || undefined,
          price: Number(form.price),
          cost: form.cost ? Number(form.cost) : undefined,
          stock_quantity: Number(form.stock_quantity || 0),
          category_id: Number(form.category_id),
          manufacturer: form.manufacturer || undefined,
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    if (!window.confirm(`Delete ${product.name}? This can't be undone.`)) return;
    setIsDeleting(true);
    try {
      await productService.delete(product.id);
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit product" : "New product"} size="md">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="SKU"
            name="sku"
            required
            disabled={isEditing}
            value={form.sku}
            onChange={handleChange}
            placeholder="SNK-030"
          />
          <SelectInput
            label="Category"
            name="category_id"
            required
            value={form.category_id}
            onChange={handleChange}
            placeholder="Select category"
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
          />
        </div>

        <TextInput label="Name" name="name" required value={form.name} onChange={handleChange} placeholder="Wasabi Peas 100g" />

        <TextInput
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Short description"
        />

        <div className="grid grid-cols-3 gap-4">
          <TextInput label="Price ($)" name="price" type="number" step="0.01" min="0.01" required value={form.price} onChange={handleChange} />
          <TextInput label="Cost ($)" name="cost" type="number" step="0.01" min="0" value={form.cost} onChange={handleChange} />
          <TextInput
            label="Stock qty"
            name="stock_quantity"
            type="number"
            min="0"
            required
            value={form.stock_quantity}
            onChange={handleChange}
          />
        </div>

        {!isEditing && (
          <TextInput label="Manufacturer" name="manufacturer" value={form.manufacturer} onChange={handleChange} placeholder="Tong Garden" />
        )}

        {error && <p className="text-sm text-danger">{error}</p>}

        <div className="flex items-center gap-3 mt-2">
          <Button type="submit" isLoading={isSubmitting} fullWidth={!isEditing}>
            {isEditing ? "Save changes" : "Create product"}
          </Button>
          {isEditing && (
            <Button type="button" variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Delete
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};
