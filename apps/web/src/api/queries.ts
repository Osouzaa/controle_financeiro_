import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import { Account, Card, Category, DashboardSummary, Goal, Transaction } from '../types/domain';

const get = async <T>(url: string) => (await api.get<T>(url)).data;

export function useDashboard(month: number, year: number) {
  return useQuery({
    queryKey: ['dashboard', month, year],
    queryFn: () => get<DashboardSummary>(`/dashboard?month=${month}&year=${year}`),
  });
}

export function useCategories(enabled = true) {
  return useQuery({ queryKey: ['categories'], queryFn: () => get<Category[]>('/categories'), enabled });
}

export function useAccounts(enabled = true) {
  return useQuery({ queryKey: ['accounts'], queryFn: () => get<Account[]>('/accounts'), enabled });
}

export function useCards(enabled = true) {
  return useQuery({ queryKey: ['cards'], queryFn: () => get<Card[]>('/cards'), enabled });
}

export function useGoals() {
  return useQuery({ queryKey: ['goals'], queryFn: () => get<Goal[]>('/goals') });
}

export function useTransactions(params = '', enabled = true) {
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => get<{ items: Transaction[]; meta: { total: number } }>(`/transactions${params}`),
    enabled,
  });
}

export function useFutureInstallments() {
  return useQuery({ queryKey: ['future-installments'], queryFn: () => get<Transaction[]>('/transactions/future-installments') });
}

export function useCreateResource(resource: string, keys: string[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => api.post(`/${resource}`, payload),
    onSuccess: () => keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] })),
  });
}

export function useUpdateResource(resource: string, keys: string[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: unknown }) => api.patch(`/${resource}/${id}`, payload),
    onSuccess: () => keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] })),
  });
}

export function useDeleteResource(resource: string, keys: string[]) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/${resource}/${id}`),
    onSuccess: () => keys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] })),
  });
}

export function usePayTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch(`/transactions/${id}/pay`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['future-installments'] });
    },
  });
}
