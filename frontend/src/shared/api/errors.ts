import { isAxiosError } from 'axios'

/**
 * Espelha `common/web/ApiError.java` (backend) — corpo padrão de toda resposta de erro da API.
 * Ver `docs/architecture/arquitetura-tecnica-frontend.md`, Seção 5.
 *
 * `fieldErrors` vem do backend como `FieldError.toString()` (Spring), não como um par
 * `{campo, mensagem}` limpo — ex.:
 * `"Field error in object 'empresaRequest' on field 'nome': rejected value []; ... default message [nome é obrigatório]"`.
 * `parseFieldErrors` abaixo extrai `{field, message}` desse formato — achado registrado no
 * relatório desta sessão, não uma mudança de contrato do backend (fora de escopo da Fase 5).
 */
export interface ApiErrorBody {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
  fieldErrors: string[]
}

/** Erro de campo já traduzido para uso em formulário (`react-hook-form`, `setError`). */
export interface FieldError {
  field: string
  message: string
}

/**
 * Forma interna e única de erro consumida pelo restante da aplicação — nenhuma tela trata o
 * corpo cru da API diretamente (`decisions.md`, decisão #46).
 */
export interface AppError {
  status: number | null
  message: string
  fieldErrors: FieldError[]
  /** true quando a requisição nem chegou a ter resposta (rede, timeout, CORS, etc.) */
  isNetworkError: boolean
}

function isApiErrorBody(data: unknown): data is ApiErrorBody {
  return (
    typeof data === 'object' &&
    data !== null &&
    'status' in data &&
    'message' in data &&
    'error' in data
  )
}

const FIELD_ERROR_PATTERN = /on field '([^']+)':.*default message \[([^\]]+)]/

/**
 * Extrai `{field, message}` do formato verboso de `FieldError.toString()` (Spring). Quando o
 * formato não bate com o padrão esperado (ex. mudança futura no backend), devolve o texto cru
 * como mensagem, sem campo associado — degrada graciosamente, nunca lança erro.
 */
function parseFieldErrors(rawFieldErrors: string[]): FieldError[] {
  return rawFieldErrors.map((raw) => {
    const match = FIELD_ERROR_PATTERN.exec(raw)
    if (match) {
      return { field: match[1], message: match[2] }
    }
    return { field: '', message: raw }
  })
}

/**
 * Traduz qualquer erro capturado pelo cliente HTTP (`shared/api/client.ts`) para o formato
 * interno único `AppError`. Ponto central de tratamento do contrato `ApiError` do backend —
 * nenhuma feature deve reimplementar essa tradução.
 */
export function translateApiError(error: unknown): AppError {
  if (isAxiosError(error)) {
    const data = error.response?.data

    if (isApiErrorBody(data)) {
      return {
        status: data.status,
        message: data.message,
        fieldErrors: parseFieldErrors(data.fieldErrors ?? []),
        isNetworkError: false,
      }
    }

    if (!error.response) {
      return {
        status: null,
        message: 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.',
        fieldErrors: [],
        isNetworkError: true,
      }
    }

    return {
      status: error.response.status,
      message: error.message,
      fieldErrors: [],
      isNetworkError: false,
    }
  }

  return {
    status: null,
    message: error instanceof Error ? error.message : 'Erro inesperado.',
    fieldErrors: [],
    isNetworkError: false,
  }
}
