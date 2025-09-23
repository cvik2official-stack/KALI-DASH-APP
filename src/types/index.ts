export interface CsvRow {
  [key: string]: string | number; // Allow numbers here to be compatible with CartItem
  NAME: string; // Explicitly define NAME as the identifier
}

export interface CartItem extends CsvRow {
  quantity: number;
}