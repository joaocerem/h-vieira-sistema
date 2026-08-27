import axios from 'axios'

/**
 * Camada única de comunicação HTTP com o backend (`decisions.md`, decisão #46).
 * Nenhuma feature/componente acessa `axios` diretamente — sempre via este módulo.
 *
 * `withCredentials: true` é obrigatório: a autenticação é feita via cookie httpOnly
 * (`decisions.md`, decisão #48), nunca via token manipulado em JavaScript. Enquanto S1
 * (`pendencias.md`, Seção 7) não estiver implementado no backend, nenhuma rota exige esse
 * cookie — a configuração já fica pronta para quando existir, sem exigir alteração aqui.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})
