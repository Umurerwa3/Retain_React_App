import { categoryApi } from '../api/categoryApi';
import { useFetch } from './useFetch';

export function useCategories() {
  const { data, ...rest } = useFetch((signal) => categoryApi.list(signal), []);
  return { categories: data ?? [], ...rest };
}
