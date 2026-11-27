export type SupplierStatus = "Activo" | "Inactivo" | "En revisión";

export interface SupplierContact {
  name: string;
  role: string;
  email: string;
  phone?: string;
}

export interface Supplier {
  id: string;
  name: string;
  nit?: string;
  code?: string;
  email: string;
  contactName: string;
  phone?: string;
  status: SupplierStatus;
  category: string;
  supplierType: "Nacional" | "Internacional";
  address?: string;
  city?: string;
  website?: string;
  contacts: SupplierContact[];
  complement?: string;
  demo: true;
}
