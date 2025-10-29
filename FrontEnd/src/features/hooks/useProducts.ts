import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/lib/api/products/useGetProducts";
import { PaginationRequest, ProductsListResponse } from "@/lib/types/types";

export function useProducts(data: PaginationRequest) {
    return useQuery<ProductsListResponse["data"]>({
        queryKey: ["products", data],
        queryFn: async () => {
          const res = await getProducts(data);
          return res; 
        },
        staleTime: 1000 * 60 * 5,
        retry: 1,
      });
}
