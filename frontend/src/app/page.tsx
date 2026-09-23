"use client";

import { useState } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";
import { productService } from "@/services/productService";
import { orderService } from "@/services/orderService";
import { Card } from "@/components/common/Card";
import { Loader } from "@/components/common/Loader";
import { Button } from "@/components/common/Button";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { NewOrderModal } from "@/components/features/Orders/NewOrderModal";
import { BoxIcon, AlertTriangleIcon, ClockIcon, DollarIcon, TrendUpIcon, PlusIcon, ChevronRightIcon } from "@/components/icons";

const chartHeights = [52, 68, 44, 78, 61, 90, 73];

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <DashboardContent />
    </DashboardLayout>
  );
}

function DashboardContent() {
  const [newOrderOpen, setNewOrderOpen] = useState(false);
  const { data: products, loading: productsLoading } = useApi(() => productService.getAll(0, 100), []);
  const { data: orders, loading: ordersLoading, refetch: refetchOrders } = useApi(() => orderService.getAll(0, 100), []);

  const loading = productsLoading || ordersLoading;

  if (loading) return <Loader label="Loading dashboard..." />;

  const lowStockProducts = (products ?? [])
    .filter((p) => p.stock_quantity <= p.reorder_level)
    .sort((a, b) => a.stock_quantity - b.stock_quantity);
  const pendingOrders = orders?.filter((o) => o.status === "pending").length ?? 0;
  const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) ?? 0;

  return (
    <>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-[26px] font-semibold text-ink">Operations Dashboard</h1>
          <p className="text-sm text-muted mt-1.5">Live view of products, stock and orders</p>
        </div>
        <Button type="button" onClick={() => setNewOrderOpen(true)}>
          <PlusIcon width={16} height={16} strokeWidth={2.2} />
          New order
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          icon={<BoxIcon className="text-primary" />}
          iconBg="bg-primary-soft"
          label="Total products"
          value={products?.length ?? 0}
          footer={<Delta positive text="products tracked" />}
        />
        <KpiCard
          icon={<AlertTriangleIcon className="text-danger" />}
          iconBg="bg-danger-soft"
          label="Low stock alerts"
          value={lowStockProducts.length}
          valueClassName="text-danger"
          footer={<span className="text-[12.5px] text-muted">Needs reordering</span>}
        />
        <KpiCard
          icon={<ClockIcon className="text-accent" />}
          iconBg="bg-accent-soft"
          label="Pending orders"
          value={pendingOrders}
          footer={<span className="text-[12.5px] text-muted">Awaiting confirmation</span>}
        />
        <KpiCard
          icon={<DollarIcon className="text-primary" />}
          iconBg="bg-primary-soft"
          label="Total revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          footer={<Delta positive text="across all orders" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
        <Card variant="outlined" className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-semibold">Revenue trend</h2>
            <span className="text-[12.5px] text-muted">Last 7 weeks</span>
          </div>
          <div className="flex-1 flex items-end gap-4 px-1.5 pb-2 min-h-[160px]">
            {chartHeights.map((h, i) => (
              <div
                key={i}
                className={`flex-1 rounded-t-lg ${i === chartHeights.length - 2 ? "bg-primary" : "bg-primary-soft"}`}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <div className="flex gap-4 px-1.5 text-[11.5px] text-muted">
            {chartHeights.map((_, i) => (
              <span key={i} className="flex-1 text-center">
                W{i + 1}
              </span>
            ))}
          </div>
        </Card>

        <Card variant="outlined" className="flex flex-col gap-4">
          <h2 className="text-[15px] font-semibold">Low stock</h2>
          <div className="flex flex-col gap-3">
            {lowStockProducts.length === 0 && <p className="text-sm text-muted">Nothing needs reordering.</p>}
            {lowStockProducts.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[13.5px] font-semibold truncate">{p.name}</div>
                  <div className="text-xs text-muted font-mono">{p.sku}</div>
                </div>
                <span className="shrink-0 bg-danger-soft text-danger text-xs font-semibold px-2.5 py-1 rounded-full">
                  {p.stock_quantity} left
                </span>
              </div>
            ))}
          </div>
          <Link href="/products" className="mt-auto text-sm font-semibold text-primary flex items-center gap-1.5 hover:text-primary-dark">
            View all products
            <ChevronRightIcon width={14} height={14} strokeWidth={2.2} />
          </Link>
        </Card>
      </div>

      <NewOrderModal
        isOpen={newOrderOpen}
        onClose={() => setNewOrderOpen(false)}
        onCreated={refetchOrders}
        products={products ?? []}
      />
    </>
  );
}

function KpiCard({
  icon,
  iconBg,
  label,
  value,
  valueClassName,
  footer,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
  footer: React.ReactNode;
}) {
  return (
    <Card variant="outlined" className="flex flex-col gap-3.5">
      <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center ${iconBg}`}>{icon}</div>
      <div>
        <div className="text-[11.5px] font-semibold text-muted uppercase tracking-wide">{label}</div>
        <div className={`font-display text-[28px] font-bold mt-1 ${valueClassName ?? "text-ink"}`}>{value}</div>
      </div>
      {footer}
    </Card>
  );
}

function Delta({ positive, text }: { positive?: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-1.5 text-[12.5px] font-semibold ${positive ? "text-success" : "text-danger"}`}>
      <TrendUpIcon width={13} height={13} strokeWidth={2.4} />
      {text}
    </div>
  );
}
