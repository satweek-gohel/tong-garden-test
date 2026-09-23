"use client";

import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { SelectInput } from "@/components/forms/SelectInput";
import { TextInput } from "@/components/forms/TextInput";
import { orderService } from "@/services/orderService";
import { useAuth } from "@/store/authStore";
import { Product } from "@/types";

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  products: Product[];
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose, onCreated, products }) => {
  const { user } = useAuth();
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      setError("You must be signed in to create an order");
      return;
    }
    if (!productId) {
      setError("Select a product");
      return;
    }

    const selectedProduct = products.find((p) => p.id === Number(productId));
    if (selectedProduct && Number(quantity) > selectedProduct.stock_quantity) {
      setError(`Only ${selectedProduct.stock_quantity} units of ${selectedProduct.name} in stock`);
      return;
    }

    setIsSubmitting(true);
    let createdOrderId: number | null = null;
    try {
      const order = await orderService.create(user.id);
      createdOrderId = order.id;
      await orderService.addItem(order.id, Number(productId), Number(quantity));
      onCreated();
      onClose();
      setProductId("");
      setQuantity("1");
    } catch (err) {
      if (createdOrderId !== null) {
        await orderService.delete(createdOrderId).catch(() => {});
        onCreated();
      }
      setError(err instanceof Error ? err.message : "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New order" size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <SelectInput
          label="Product"
          required
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          placeholder="Select a product"
          options={products.map((p) => ({ value: p.id, label: `${p.name} — $${Number(p.price).toFixed(2)}` }))}
        />
        <TextInput
          label="Quantity"
          type="number"
          min="1"
          required
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Create order
        </Button>
      </form>
    </Modal>
  );
};
