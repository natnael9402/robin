export const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.paxorapremiumlab.com/api';

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
    sparkline_in_7d?: {
        price: number[];
    };
}

export interface User {
    id: number;
    email: string;
    name?: string;
    balance: number;
    isAdmin: boolean;
    isVerified: boolean;
}

export interface Transaction {
    id: number;
    type: 'deposit' | 'withdrawal';
    amount: string;
    status: 'pending' | 'completed' | 'rejected';
    createdAt: string;
    network?: string;
    description?: string;
}

async function authFetch(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        cache: 'no-store',
        ...options,
        headers: headers as HeadersInit,
    });

    const text = await res.text();
    let data;
    try {
        data = JSON.parse(text);
    } catch {
        data = { message: text || res.statusText };
    }

    if (!res.ok) {
        throw new Error(data.message || data.error || `Error ${res.status}`);
    }

    return data;
}

// Auth — /ol routes: POST /api/register, POST /api/login, GET /api/users/profile
export const authApi = {
    signup: (data: any) => authFetch('/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: any) => authFetch('/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.resolve();
    },
    getProfile: () => authFetch('/users/profile', { method: 'GET' }),
    changePassword: (oldPassword: string, newPassword: string) =>
        authFetch('/change-password', {
            method: 'POST',
            body: JSON.stringify({ current_password: oldPassword, password: newPassword, password_confirmation: newPassword }),
        }),
};

// Wallet — deposits at /api/deposit, withdrawals at /api/withdrawals, transactions at /api/transactions
export const walletApi = {
    deposit: (amount: number, network: string) =>
        authFetch('/deposit', { method: 'POST', body: JSON.stringify({ amount, network }) }),
    withdraw: (amount: number, network: string, walletAddress: string, withdrawPassword?: string) =>
        authFetch('/withdrawals', {
            method: 'POST',
            body: JSON.stringify({ amount, network, walletAddress, currency: 'USDT', withdrawalPassword: withdrawPassword }),
        }),
    getTransactions: () => authFetch('/transactions', { method: 'GET' }),
};

// Mining — products at /api/mining/products, hostings at /api/mining/hostings
export const miningApi = {
    getPlans: () => authFetch('/mining/products'),
    subscribe: (planId: number, amount?: number) =>
        authFetch('/mining/hostings', { method: 'POST', body: JSON.stringify({ productId: planId, amount, currency: 'USDT' }) }),
    getMyMining: () => authFetch('/mining/hostings'),
    getActive: () => authFetch('/mining/hostings'),
};

// Loans — /api/loans (GET list, POST apply)
export const loansApi = {
    apply: (amount: number, duration: number) =>
        authFetch('/loans', { method: 'POST', body: JSON.stringify({ amount, duration }) }),
    getMyLoans: () => authFetch('/loans'),
};

// Verification / KYC — /api/kyc-submissions
export const verificationApi = {
    submit: (data: any) =>
        authFetch('/kyc-submissions', { method: 'POST', body: JSON.stringify(data) }),
    getStatus: () => authFetch('/kyc-submissions'),
};

// Assets — /api/assets (GET list), buy/sell via /api/trades/spot (crypto/metals) or /api/trades/stocks (stocks)
export const assetsApi = {
    getPortfolio: () => authFetch('/assets').then((res: any) => res?.data?.assets || res?.assets || res || []),
    buy: (symbol: string, type: string, amount: number, price: number, name: string, marketType?: string) =>
        authFetch('/trades/spot', {
            method: 'POST',
            body: JSON.stringify({ symbol, direction: 'buy', amount, from_coin: 'USDT', to_coin: symbol, market_type: marketType || type, exchange_rate: price }),
        }),
    sell: (symbol: string, amount: number, price: number, name?: string, type?: string, marketType?: string) =>
        authFetch('/trades/spot', {
            method: 'POST',
            body: JSON.stringify({ symbol, direction: 'sell', amount, from_coin: symbol, to_coin: 'USDT', market_type: marketType || type, exchange_rate: price }),
        }),
    buyStock: (symbol: string, shares: number, price?: number) =>
        authFetch('/trades/stocks', {
            method: 'POST',
            body: JSON.stringify({ symbol, direction: 'buy', shares, exchange_rate: price }),
        }),
    sellStock: (symbol: string, shares: number, price?: number) =>
        authFetch('/trades/stocks', {
            method: 'POST',
            body: JSON.stringify({ symbol, direction: 'sell', shares, exchange_rate: price }),
        }),
};

// Trades — /api/trades
export const tradesApi = {
    start: (asset: string, amount: number, duration: number) =>
        authFetch('/trades/option', {
            method: 'POST',
            body: JSON.stringify({ symbol: asset, amount, duration, direction: 'buy' }),
        }),
    resolve: (id: number) =>
        authFetch(`/trades/${id}/cancel`, { method: 'POST' }),
    transfer: (amount: number) =>
        authFetch('/transactions', { method: 'GET' }), // no direct transfer endpoint — no-op
    getBalance: () => authFetch('/profile'),
};

// Market — /api/market/list, /api/market/historical
export const marketApi = {
    getStocks: () =>
        authFetch('/market/list').then((res: any) => res?.stocks || res?.data?.stocks || []),
    getCrypto: () =>
        authFetch('/market/list').then((res: any) => res?.crypto || res?.data?.crypto || []),
    getCryptoDetail: (id: string) =>
        authFetch('/market/list').then((res: any) => {
            const list = res?.crypto || res?.data?.crypto || [];
            return list.find((c: any) => c.id === id) || null;
        }),
    getCryptoHistory: (id: string, days: number = 7) => {
        const interval = days <= 1 ? '1h' : '1d';
        return authFetch(`/market/historical?symbol=${id}&market=crypto&interval=${interval}&limit=100`);
    },
    getStockHistory: (symbol: string, range: string = '1d') => {
        const interval = range === '1d' ? '15m' : '1d';
        return authFetch(`/market/historical?symbol=${symbol}&market=stocks&interval=${interval}&limit=100`);
    },
};

// Arbitrage — /api/arbitrage/products, /api/arbitrage/hostings
export const arbitrageApi = {
    getPlans: () => authFetch('/arbitrage/products', { method: 'GET' }),
    startHosting: (planCode: string, amount: number, currency = 'USDT') =>
        authFetch('/arbitrage/hostings', {
            method: 'POST',
            body: JSON.stringify({ product_id: planCode, amount, currency }),
        }),
    myHostings: () => authFetch('/arbitrage/hostings', { method: 'GET' }),
};

export async function logout() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
}
