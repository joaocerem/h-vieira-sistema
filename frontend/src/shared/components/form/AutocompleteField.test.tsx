import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AutocompleteField, type AutocompleteOption } from './AutocompleteField'

const OPCOES: AutocompleteOption[] = [
  { value: 'f1', label: 'Posto Shell' },
  { value: 'f2', label: 'Posto Ipiranga' },
  { value: 'f3', label: 'Concreteira Central' },
]

function ControlledWrapper({
  initialValue,
  options = OPCOES,
  onQuickCreate,
}: {
  initialValue: string
  options?: AutocompleteOption[]
  onQuickCreate?: (nome: string) => Promise<AutocompleteOption>
}) {
  const [value, setValue] = useState(initialValue)
  return (
    <AutocompleteField
      id="fornecedorId"
      label="Fornecedor"
      value={value}
      onValueChange={setValue}
      options={options}
      placeholder="Selecione o fornecedor"
      onQuickCreate={onQuickCreate}
    />
  )
}

describe('AutocompleteField', () => {
  it('mostra o label da opção selecionada quando fechado', () => {
    render(<ControlledWrapper initialValue="f2" />)
    expect(screen.getByRole('combobox')).toHaveValue('Posto Ipiranga')
  })

  it('mostra todas as opções ao focar, mesmo sem digitar nada', async () => {
    const user = userEvent.setup()
    render(<ControlledWrapper initialValue="" />)

    await user.click(screen.getByRole('combobox'))

    expect(await screen.findByRole('option', { name: 'Posto Shell' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Posto Ipiranga' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Concreteira Central' })).toBeInTheDocument()
  })

  it('filtra as opções conforme o usuário digita', async () => {
    const user = userEvent.setup()
    render(<ControlledWrapper initialValue="" />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'posto')

    expect(await screen.findByRole('option', { name: 'Posto Shell' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Posto Ipiranga' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Concreteira Central' })).not.toBeInTheDocument()
  })

  it('seleciona uma opção ao clicar', async () => {
    const user = userEvent.setup()
    render(<ControlledWrapper initialValue="" />)

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'Posto Ipiranga' }))

    expect(screen.getByRole('combobox')).toHaveValue('Posto Ipiranga')
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('seleciona a opção destacada ao pressionar Enter', async () => {
    const user = userEvent.setup()
    render(<ControlledWrapper initialValue="" />)

    await user.click(screen.getByRole('combobox'))
    // O destaque já nasce no primeiro item (Posto Shell) — um só ArrowDown chega no segundo.
    await user.keyboard('{ArrowDown}{Enter}')

    expect(screen.getByRole('combobox')).toHaveValue('Posto Ipiranga')
  })

  it('fecha sem selecionar ao pressionar Escape', async () => {
    const user = userEvent.setup()
    render(<ControlledWrapper initialValue="f1" />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'concre')
    await user.keyboard('{Escape}')

    expect(screen.queryByRole('option')).not.toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveValue('Posto Shell')
  })

  it('mostra "criar novo" quando o texto não corresponde a nenhuma opção existente', async () => {
    const user = userEvent.setup()
    render(<ControlledWrapper initialValue="" onQuickCreate={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'Fornecedor Novo Ltda')

    expect(
      await screen.findByRole('option', { name: '+ Criar "Fornecedor Novo Ltda"' }),
    ).toBeInTheDocument()
  })

  it('não mostra "criar novo" quando o texto já corresponde a uma opção existente', async () => {
    const user = userEvent.setup()
    render(<ControlledWrapper initialValue="" onQuickCreate={vi.fn()} />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'Posto Shell')

    expect(screen.queryByRole('option', { name: /criar/i })).not.toBeInTheDocument()
  })

  it('cria um novo registro e o seleciona automaticamente', async () => {
    const user = userEvent.setup()
    const onQuickCreate = vi.fn().mockResolvedValue({ value: 'f9', label: 'Fornecedor Novo Ltda' })
    render(<ControlledWrapper initialValue="" onQuickCreate={onQuickCreate} />)

    await user.click(screen.getByRole('combobox'))
    await user.type(screen.getByRole('combobox'), 'Fornecedor Novo Ltda')
    await user.click(await screen.findByRole('option', { name: /criar/i }))

    expect(onQuickCreate).toHaveBeenCalledWith('Fornecedor Novo Ltda')
    await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('Fornecedor Novo Ltda'))
  })
})
