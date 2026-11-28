import type {
  DashboardSummary,
  PerseoSupplier,
  SupplierMonthlyReport,
  SupplierPage,
} from "../types/perseoApi";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL?.trim() || "/api/v1"
).replace(/\/+$/, "");

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
    signal,
  });

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => undefined);
    const detail =
      body && typeof body === "object" && "detail" in body &&
      typeof body.detail === "string"
        ? body.detail
        : `La API respondió ${response.status} ${response.statusText}`.trim();
    throw new ApiRequestError(detail, response.status);
  }

  return response.json() as Promise<T>;
}

export interface SupplierQuery {
  search?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}

export const perseoApi = {
  getDashboardSummary(signal?: AbortSignal) {
    return getJson<DashboardSummary>("/dashboard/summary", signal);
  },

  listSuppliers(query: SupplierQuery = {}, signal?: AbortSignal) {
    const params = new URLSearchParams();
    if (query.search?.trim()) params.set("search", query.search.trim());
    if (query.isActive !== undefined) params.set("is_active", String(query.isActive));
    params.set("limit", String(query.limit ?? 25));
    params.set("offset", String(query.offset ?? 0));
    return getJson<SupplierPage>(`/suppliers?${params.toString()}`, signal);
  },

  getSupplier(code: string, signal?: AbortSignal) {
    return getJson<PerseoSupplier>(`/suppliers/${encodeURIComponent(code)}`, signal);
  },

  getSupplierReports(code: string, signal?: AbortSignal) {
    return getJson<SupplierMonthlyReport[]>(
      `/suppliers/${encodeURIComponent(code)}/reports`,
      signal,
    );
  },
};
