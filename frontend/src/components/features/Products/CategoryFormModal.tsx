"use client";

import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { TextInput } from "@/components/forms/TextInput";
import { categoryService } from "@/services/categoryService";

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const CategoryFormModal: React.FC<CategoryFormModalProps> = ({ isOpen, onClose, onSaved }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await categoryService.create({ name, description: description || undefined });
      onSaved();
      onClose();
      setName("");
      setDescription("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New category" size="sm">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <TextInput label="Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Snacks" />
        <TextInput
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
        />

        {error && <p className="text-sm text-danger">{error}</p>}

        <Button type="submit" fullWidth isLoading={isSubmitting}>
          Create category
        </Button>
      </form>
    </Modal>
  );
};
