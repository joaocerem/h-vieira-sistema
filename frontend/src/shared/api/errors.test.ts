import { describe, expect, it } from 'vitest'
import { AxiosError, AxiosHeaders } from 'axios'
import { translateApiError } from './errors'

function makeAxiosError({
  status,
  data,
  hasResponse = true,
}: {
  status?: number
  data?: unknown
  hasResponse?: boolean
}) {
  const error = new AxiosError('Request failed', undefined, undefined, undefined, hasResponse ? {
    status: status ?? 500,
    statusText: 'Error',
    headers: new AxiosHeaders(),
    config: { headers: new AxiosHeaders() },
    data,
  } : undefined)
  return error
}

describe('translateApiError', () => {
  it('traduz um ApiError do backend, incluindo fieldErrors no formato Spring cru', () => {
    const rawFieldError =
      "Field error in object 'empresaRequest' on field 'nome': rejected value []; default message [nome é obrigatório]"

    const error = makeAxiosError({
      status: 400,
      data: {
        timestamp: '2026-08-19T12:00:00Z',
        status: 400,
        error: 'Dados inválidos',
        message: 'Um ou mais campos são inválidos',
        path: '/api/empresas',
        fieldErrors: [rawFieldError],
      },
    })

    const result = translateApiError(error)

    expect(result.status).toBe(400)
    expect(result.message).toBe('Um ou mais campos são inválidos')
    expect(result.isNetworkError).toBe(false)
    expect(result.fieldErrors).toEqual([{ field: 'nome', message: 'nome é obrigatório' }])
  })

  it('degrada graciosamente quando o fieldError não bate com o formato esperado', () => {
    const error = makeAxiosError({
      status: 400,
      data: {
        timestamp: '2026-08-19T12:00:00Z',
        status: 400,
        error: 'Dados inválidos',
        message: 'Um ou mais campos são inválidos',
        path: '/api/empresas',
        fieldErrors: ['algo inesperado'],
      },
    })

    const result = translateApiError(error)

    expect(result.fieldErrors).toEqual([{ field: '', message: 'algo inesperado' }])
  })

  it('identifica erro de rede (sem resposta do servidor)', () => {
    const error = makeAxiosError({ hasResponse: false })

    const result = translateApiError(error)

    expect(result.isNetworkError).toBe(true)
    expect(result.status).toBeNull()
  })

  it('devolve mensagem genérica para erro que não é do axios', () => {
    const result = translateApiError(new Error('boom'))

    expect(result.message).toBe('boom')
    expect(result.fieldErrors).toEqual([])
  })
})
