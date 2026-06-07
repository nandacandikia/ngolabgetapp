export type Category = 'Semua' | 'Bakso & Mie' | 'Aneka Nasi' | 'Gorengan' | 'Ice Cream' | 'Minuman';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  discountPrice?: number;
  category: Category;
  image: string;
  inStock: boolean;
  stock?: number;
  isPromo?: boolean;
  isAirGesture?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
  note?: string;
}

export type PaymentMethod = 'QRIS' | 'GoPay' | 'OVO' | 'Dana' | 'BCA' | 'Mandiri' | 'Tunai';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  tableNumber: string;
  paymentMethod: PaymentMethod;
  timestamp: string;
  status: 'PENDING' | 'DIPROSES' | 'SELESAI' | 'DIBATALKAN';
  customerName?: string;
  pointsEarned?: number;
  rating?: number;
  review?: string;
}

export interface Voucher {
  id: string;
  title: string;
  description: string;
  cost: number;
  discount: string;
  expiry: string;
  color: string;
  icon: string;
}

export interface MyVoucher extends Voucher {
  claimedAt: string;
  code: string;
  used: boolean;
}
