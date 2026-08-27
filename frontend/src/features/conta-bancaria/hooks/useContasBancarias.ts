import { useQuery } from '@tanstack/react-query'
import { contaBancariaApi } from '../api/contaBancariaApi'
import { contaBancariaKeys } from './queryKeys'

export function useContasBancarias() {
  return useQuery({ queryKey: contaBancariaKeys.all, queryFn: contaBancariaApi.listar })
}
