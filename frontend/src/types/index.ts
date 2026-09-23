export interface Category {
  id: number;
  name: string;
  description?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string | null;
  price: number;
  cost?: number | null;
  stock_quantity: number;
  reorder_level: number;
  category_id: number;
  manufacturer?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  status: string;
  total_amount: number;
  payment_status: string;
  payment_method?: string | null;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
}
