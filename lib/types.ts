/** One cleaned sales row (order_date is an ISO "YYYY-MM-DD" string). */
export interface SaleRecord {
  order_id: string;
  order_date: string;
  region: string;
  category: string;
  sub_category: string;
  product_name: string;
  sales: number;
  quantity: number;
  discount: number;
  profit: number;
}

/** A row before cleaning: values may be blank, null or invalid. */
export type RawRow = Record<string, string | number | null>;

export interface Kpis {
  total_revenue: number;
  total_profit: number;
  profit_margin: number; // percent, e.g. 18.4
  total_orders: number;
  average_order_value: number;
}

export interface MonthlyPoint {
  month: string; // "YYYY-MM"
  revenue: number;
  profit: number;
  orders: number;
}

export interface RegionPoint {
  region: string;
  revenue: number;
}

export interface CategoryPoint {
  category: string;
  revenue: number;
  profit: number;
}

export interface ProductPoint {
  product_name: string;
  revenue: number;
}

export interface DataQuality {
  source_rows: number;
  clean_rows: number;
  duplicates_removed: number;
  missing_values_handled: number;
  invalid_rows_removed: number;
}

/** Shape returned by POST /api/analyze and POST /api/demo-analyze. */
export interface Analytics {
  kpis: Kpis;
  monthly: MonthlyPoint[];
  regions: RegionPoint[];
  categories: CategoryPoint[];
  top_products: ProductPoint[];
  data_quality: DataQuality;
  records: SaleRecord[];
}

export interface Filters {
  start: string; // "" = no lower bound
  end: string; // "" = no upper bound
  regions: string[]; // [] = all regions
  categories: string[]; // [] = all categories
}

export interface UploadError {
  message: string;
  missingColumns: string[];
}
