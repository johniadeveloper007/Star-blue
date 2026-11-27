import { demoSuppliers } from "../data/demo/suppliers";
import type { Supplier } from "../types/supplier";

export interface SupplierFilters {
  status?: string;
  category?: string;
  supplierType?: string;
  search?: string;
}

export const supplierService = {
  async list(filters: SupplierFilters = {}): Promise<Supplier[]> {
    const search = filters.search?.trim().toLocaleLowerCase("es") ?? "";
    return demoSuppliers.filter((supplier) => {
      const searchable = [
        supplier.name,
        supplier.nit,
        supplier.code,
        supplier.email,
      ].filter(Boolean).join(" ").toLocaleLowerCase("es");

      return (
        (!search || searchable.includes(search)) &&
        (!filters.status || supplier.status === filters.status) &&
        (!filters.category || supplier.category === filters.category) &&
        (!filters.supplierType || supplier.supplierType === filters.supplierType)
      );
    });
  },

  async getById(id: string): Promise<Supplier | undefined> {
    return demoSuppliers.find((supplier) => supplier.id === id);
  },
};
