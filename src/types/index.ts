export interface CsvRow {
  [key: string]: string | number; // Allow numbers here to be compatible with CartItem
  id: string;
}

export interface CartItem extends CsvRow {
  quantity: number;
}