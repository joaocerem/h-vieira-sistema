import { useQuery } from '@tanstack/react-query'
import { transferenciaInternaApi } from '../api/transferenciaInternaApi'
import { transferenciaInternaKeys } from './queryKeys'

export function useTransferenciasInternas() {
  return useQuery({
    queryKey: transferenciaInternaKeys.all,
    queryFn: transferenciaInternaApi.listar,
  })
}
