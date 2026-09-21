export type PlanType = 'free' | 'monthly' | 'permanent';
export type OrderStatus = 'pending' | 'paid' | 'refunded' | 'cancelled';
export type PaymentMethod = 'wechat' | 'alipay' | 'other';

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash?: string;
  created_at: string;
  updated_at: string | null;
  last_login_at: string | null;
}

export interface UserSubscription {
  user_id: string;
  plan: PlanType;
  plan_expires_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface UserWithSubscription extends User {
  subscription?: UserSubscription | null;
  total_orders?: number;
  total_spent?: number;
}

export interface Order {
  id: string;
  user_id: string;
  out_trade_no: string;
  trade_no: string | null;
  plan: PlanType;
  amount: number | string;
  status: OrderStatus;
  payment_method: PaymentMethod | null;
  created_at: string;
  paid_at: string | null;
  refunded_at: string | null;
  user?: Pick<User, 'username' | 'email'>;
}

export interface ExportLimit {
  user_id: string;
  export_date: string;
  count: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  is_popup: boolean;
  created_at: string;
}

export interface DashboardStats {
  userCount: number;
  todayNewUsers: number;
  freeUsersCount: number;
  monthlyUsersCount: number;
  permanentUsersCount: number;
  totalOrders: number;
  paidOrders: number;
  totalRevenue: number;
  todayExports: number;
  recentOrders: Order[];
  recentUsers: UserWithSubscription[];
}
