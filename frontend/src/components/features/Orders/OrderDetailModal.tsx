"use client";

import { useState } from "react";
import { Modal } from "@/components/common/Modal";
import { Button } from "@/components/common/Button";
import { Badge } from "@/components/common/Badge";
import { SelectInput } from "@/components/forms/SelectInput";
import { orderService } from "@/services/orderService";
import { Order, Product } from "@/types";

interface OrderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChanged: () => void;
  order: Order | null;
  products: Product[];
}

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  confirmed: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
};

const statusOptions = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const paymentMethods = ["credit_card", "bank_transfer", "cash"];

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ isOpen, onClose, onChanged, order, products }) => {
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [error, setError] = useState<string | null>(null);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  if (!order) return null;

  const productById = new Map(products.map((p) => [p.id, p]));

  const handleStatusUpdate = async () => {
    if (!status || status === order.status) return;
    setError(null);
    setIsSavingStatus(true);
    try {
      await orderService.updateStatus(order.id, status);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handlePayment = async () => {
    setError(null);
    setIsPaying(true);
    try {
      await orderService.processPayment(order.id, Number(order.total_amount), paymentMethod);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={order.order_number} size="lg">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge variant={statusVariant[order.status] ?? "default"} className="capitalize">
              {order.status}
            </Badge>
            <span className="text-sm text-muted">{new Date(order.created_at).toLocaleString()}</span>
          </div>
          <span className="font-display text-2xl font-bold">${Number(order.total_amount).toFixed(2)}</span>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-ink mb-3">Items</h3>
          <div className="border border-line rounded-xl overflow-hidden">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-bg">
                  <th className="text-left font-semibold text-muted px-4 py-2.5">Product</th>
                  <th className="text-right font-semibold text-muted px-4 py-2.5">Qty</th>
                  <th className="text-right font-semibold text-muted px-4 py-2.5">Unit price</th>
                  <th className="text-right font-semibold text-muted px-4 py-2.5">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.order_items.map((item) => (
                  <tr key={item.id} className="border-t border-line">
                    <td className="px-4 py-2.5">{productById.get(item.product_id)?.name ?? `Product #${item.product_id}`}</td>
                    <td className="px-4 py-2.5 text-right">{item.quantity}</td>
                    <td className="px-4 py-2.5 text-right">${Number(item.unit_price).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right font-semibold">${Number(item.subtotal).toFixed(2)}</td>
                  </tr>
                ))}
                {order.order_items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-muted">
                      No items on this order yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <SelectInput
              label="Update status"
              value={status || order.status}
              onChange={(e) => setStatus(e.target.value)}
              options={statusOptions.map((s) => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))}
            />
            <Button type="button" variant="outline" size="sm" onClick={handleStatusUpdate} isLoading={isSavingStatus}>
              Save status
            </Button>
          </div>

          {order.payment_status !== "completed" && (
            <div className="flex flex-col gap-2">
              <SelectInput
                label="Payment method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={paymentMethods.map((m) => ({ value: m, label: m.replace("_", " ") }))}
              />
              <Button type="button" size="sm" onClick={handlePayment} isLoading={isPaying}>
                Process payment
              </Button>
            </div>
          )}
        </div>

        {order.payment_status === "completed" && (
          <p className="text-sm text-success font-semibold">Payment completed via {order.payment_method}.</p>
        )}

        {error && <p className="text-sm text-danger">{error}</p>}
      </div>
    </Modal>
  );
};
