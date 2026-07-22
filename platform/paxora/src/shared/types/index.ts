export type ID = number | string;

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { page: number; perPage: number; total: number };
}

export interface AccountBalance {
  id: number;
  user_id: number;
  type: 'spot' | 'trading' | 'fast_trade';
  balance: number;
}

export interface User {
  id: number;
  email: string;
  name?: string;
  phone?: string;
  role: 'user' | 'admin';
  balance: number;
  accountBalances?: AccountBalance[];
  isVerified: boolean;
  level: number;
  createdAt: string;
  kycStatus?: 'unverified' | 'pending' | 'approved' | 'verified' | 'rejected';
}

export interface TransferPayload {
  from: 'spot' | 'trading' | 'fast_trade';
  to: 'spot' | 'trading' | 'fast_trade';
  amount: number;
}

export interface BalancesResponse {
  spot: number;
  trading: number;
  fast_trade: number;
  total: number;
}

export interface Transaction {
  id: number;
  type: 'deposit' | 'withdrawal' | 'trade' | 'fee' | 'arbitrage' | 'mining' | 'transfer' | 'deposit_bonus';
  amount: string;
  status: 'pending' | 'completed' | 'rejected' | 'approved';
  createdAt: string;
  network?: string;
  category?: string;
  created_at?: string;
}

export interface MarketCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_24h?: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  sparkline_in_7d?: { price: number[] };
}

export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface TradeOutcome {
  outcome: 'WIN' | 'LOSS' | 'SPOT';
}

export interface TradeResolution {
  id: number;
  status: 'WIN' | 'LOSS' | 'SPOT';
  profit: number;
  tradingBalance?: number;
  entry_price?: number;
  exit_price?: number | null;
  fee?: number;
  opened_at?: string;
  closed_at?: string | null;
  return_rate?: number;
  expected_return?: number;
}

export interface ChartPoint {
  time: number;
  price: number;
}

export interface UserAsset {
  id: number;
  userId: number;
  symbol: string;
  name: string;
  type: 'crypto' | 'stock';
  amount: number;
  avgPrice: number;
}

export interface MiningPlan {
  id: number;
  name: string;
  minAmount: number;
  maxAmount: number;
  dailyRate: number;
  durationDays: number;
  hashPower: string;
  power: string;
  networkType: string;
  isActive: boolean;
  min_amount?: number;
  max_amount?: number;
  daily_rate?: number;
  duration_days?: number;
  hash_power?: string;
  network_type?: string;
  is_active?: boolean;
}

export interface UserMining {
  id: number;
  planId: number;
  amount: number;
  currency?: string;
  startDate: string;
  endDate: string;
  active: boolean;
  status: 'running' | 'paused' | 'ended' | 'cancelled';
  totalEarned: number;
  plan?: MiningPlan;
  plan_id?: number;
  start_date?: string;
  end_date?: string;
}

export interface Loan {
  id: number;
  userId: number;
  amount: number;
  duration: number;
  interest_rate: number;
  total_payable: number;
  status: 'pending' | 'approved' | 'rejected' | 'repaid' | 'overdue';
  created_at: string;
  interestRate?: number;
  totalPayable?: number;
  createdAt?: string;
}

export interface ArbitragePlan {
  id: number;
  name: string;
  code: string;
  minAmount: number;
  maxAmount: number;
  dailyRate: number;
  durationDays: number;
  min_amount?: number;
  max_amount?: number;
  daily_rate?: number;
  duration_days?: number;
  planCode?: string;
}

export interface ArbitrageHosting {
  id: number;
  planCode: string;
  amount: number;
  currency: string;
  startDate: string;
  endDate: string;
  active: boolean;
  status: 'running' | 'ended' | 'cancelled';
  plan_code?: string;
  start_date?: string;
  end_date?: string;
}

export interface Verification {
  status: 'unverified' | 'pending' | 'approved' | 'verified' | 'rejected';
  documents?: Record<string, string>;
}

export interface TicketAttachment {
  url?: string;
  downloadUrl?: string;
  pathname?: string;
  path?: string;
  name: string;
  mime: string;
  size: number;
}

export interface TicketMessage {
  id: number;
  ticket_id: number;
  user_id: number | null;
  admin_id: number | null;
  message: string;
  is_read: boolean;
  attachments: TicketAttachment[];
  created_at: string;
  updated_at?: string;
  user?: { id: number; name: string; email: string } | null;
  admin?: { id: number; name: string; email: string } | null;
}

export interface SupportTicket {
  id: number;
  user_id: number;
  subject: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  last_reply_at: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at?: string;
  messages?: TicketMessage[];
  latest_message?: TicketMessage | null;
  user?: { id: number; name: string; email: string };
}

export interface TradeOption {
  duration: number;
  return_rate: number;
  expected_return: number;
}

export interface TradeContract {
  quantity: number;
  leverage: number;
  liquidation_price: number;
  take_profit: number | null;
  stop_loss: number | null;
}

export interface TradeSpot {
  quantity: number;
  market_price: number;
  exchange_rate: number | null;
  from_coin: string | null;
  to_coin: string | null;
}

export interface Trade {
  id: number;
  user_id: number;
  symbol: string;
  type: 'option' | 'contract' | 'spot' | 'stock';
  direction: 'buy' | 'sell';
  amount: number;
  entry_price: number;
  exit_price: number | null;
  exchange_rate: number | null;
  from_coin: string | null;
  to_coin: string | null;
  status: 'open' | 'closed' | 'canceled';
  result: 'won' | 'lost' | null;
  pnl: number;
  fee: number;
  opened_at: string;
  closed_at: string | null;
  closed_by: number | null;
  created_at: string;
  updated_at: string;
  option: TradeOption | null;
  contract: TradeContract | null;
  spot: TradeSpot | null;
}

export interface TradeStats {
  overview: {
    total_trades: number;
    open_trades: number;
    closed_trades: number;
    won_trades: number;
    lost_trades: number;
    win_rate: number;
    total_pnl: number;
    total_invested: number;
    total_fees: number;
    roi: number;
  };
  by_type: Array<{ type: string; count: number; total_pnl: number }>;
}

export interface AppNotification {
  id: string;
  user_id: string;
  admin_id: string | null;
  title: string;
  message: string;
  image_url: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  updated_at: string;
  admin?: { id: string; name: string; email: string } | null;
}

/** @deprecated Use TicketMessage instead */
export interface ChatMessage {
  id: number;
  userId: number;
  message: string;
  fromAdmin: boolean;
  createdAt: string;
}