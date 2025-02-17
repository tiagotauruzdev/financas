
export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  created_at: string;
}

export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  account_id: string;
  date: string;
  created_at: string;
  updated_at: string;
}
