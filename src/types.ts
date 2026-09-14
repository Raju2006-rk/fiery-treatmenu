export type CategoryId =
  | 'all'
  | 'rice_noodles'
  | 'biryani'
  | 'fried_chicken'
  | 'wings'
  | 'veg_bites'
  | 'non_veg_bites'
  | 'veg_rolls'
  | 'non_veg_rolls'
  | 'burgers'
  | 'sandwiches'
  | 'momos';

export interface MenuItem {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  isVeg: boolean;
  isEgg?: boolean;
  spiceLevel?: 1 | 2 | 3;
  description: string;
  pieceCount?: string;
  isSpecial?: boolean;
  isBestseller?: boolean;
  inStock: boolean;
  image: string;
  tags: string[];
  basmatiRiceNote?: boolean;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

export type OrderType = 'delivery' | 'dine_in' | 'takeaway';

export interface OrderDetails {
  id: string;
  items: CartItem[];
  orderType: OrderType;
  customerName: string;
  customerPhone: string;
  address?: string;
  tableNumber?: string;
  instructions?: string;
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  timestamp: number;
  status: 'new' | 'preparing' | 'dispatched' | 'completed';
}

export interface CategoryMeta {
  id: CategoryId;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  badge?: string;
}
