"use client";

import { useState } from "react";
import { useApi } from "@/hooks/useApi";
import { orderService } from "@/services/orderService";
import { productService } from "@/services/productService";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Loader } from "@/components/common/Loader";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { NewOrderModal } from "@/components/features/Orders/NewOrderModal";
import { OrderDetailModal } from "@/components/features/Orders/OrderDetailModal";
import { SearchIcon, ChevronRightIcon, PlusIcon } from "@/components/icons";
import clsx from "clsx";

const statusVariant: Record<string, "default" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  confirmed: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "danger",
};

const statusFilters = ["All", "Pending", "Confirmed", "Delivered"];

export default function OrdersPage() {
  return (
    <DashboardLayout>
      <OrdersContent />
    </DashboardLayout>
  );
}

function OrdersContent() {
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data: orders, loading, error, refetch } = useApi(() => orderService.getAll(0, 50), []);
  const { data: products } = useApi(() => productService.getAll(0, 100), []);

  const selectedOrder = orders?.find((o) => o.id === selectedOrderId) ?? null;

  const filtered = (orders ?? []).filter((o) => {
    const matchesStatus = statusFilter === "All" || o.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = o.order_number.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-[26px] font-semibold text-ink">Orders</h1>
          <p className="text-sm text-muted mt-1.5">{orders?.length ?? 0} orders total</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-surface border border-line rounded-[10px] px-3.5 py-2.5 w-60">
            <SearchIcon width={16} height={16} className="text-muted shrink-0" />
            <input
              type="text"
              placeholder="Search orders..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border-none outline-none text-sm bg-transparent w-full font-sans"
            />
          </div>
          <Button type="button" onClick={() => setNewOrderOpen(true)}>
            <PlusIcon width={16} height={16} strokeWidth={2.2} />
            New order
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        {statusFilters.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={clsx(
              "px-4 py-2 rounded-full text-[13px] font-semibold transition-colors",
              statusFilter === s ? "bg-primary text-[#F5F3EE]" : "bg-surface border border-line text-ink hover:border-ink/30"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {loading && <Loader label="Loading orders..." />}
      {error && <p className="text-danger text-sm">Failed to load orders: {error.message}</p>}

      {!loading && !error && (
        <div className="bg-surface border border-line rounded-2xl overflow-hidden flex-1">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-4 pt-[18px] pb-3">Order</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-4 pt-[18px] pb-3">Date</th>
                <th className="text-left text-xs font-semibold text-muted uppercase tracking-wide px-4 pt-[18px] pb-3">Status</th>
                <th className="text-right text-xs font-semibold text-muted uppercase tracking-wide px-4 pt-[18px] pb-3">Amount</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className="border-t border-line hover:bg-bg/60 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-4 text-sm font-mono font-semibold">{order.order_number}</td>
                  <td className="px-4 py-4 text-sm text-muted">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    <Badge variant={statusVariant[order.status] ?? "default"} className="capitalize">
                      {order.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-right">${Number(order.total_amount).toFixed(2)}</td>
                  <td className="px-4 py-4 text-center text-muted">
                    <ChevronRightIcon width={16} height={16} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-muted text-sm px-4 py-6">No orders found.</p>}
        </div>
      )}

      <NewOrderModal
        isOpen={newOrderOpen}
        onClose={() => setNewOrderOpen(false)}
        onCreated={refetch}
        products={products ?? []}
      />

      <OrderDetailModal
        isOpen={selectedOrderId !== null}
        onClose={() => setSelectedOrderId(null)}
        onChanged={refetch}
        order={selectedOrder}
        products={products ?? []}
      />
    </>
  );
}
