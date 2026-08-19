package br.com.joaocerem.hvieira_financeiro.application.conciliacaobancaria;

import br.com.joaocerem.hvieira_financeiro.application.contabancaria.ContaBancariaService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.MovimentacaoBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.MovimentacaoBancariaRepository;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.VinculoConciliacao;
import br.com.joaocerem.hvieira_financeiro.domain.conciliacaobancaria.VinculoConciliacaoRepository;
import br.com.joaocerem.hvieira_financeiro.domain.contabancaria.ContaBancaria;
import br.com.joaocerem.hvieira_financeiro.domain.liquidacaofinanceira.LiquidacaoFinanceira;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Casos de uso de Movimentação Bancária. Ver `docs/domain-model/12-movimentacao-bancaria.md`.
 *
 * Sem `criar` livre: "nunca digitada livremente pelo usuário como um fato novo" (Seção 4 do documento de
 * domínio) — só nasce por `importar` (lote de extrato, upload manual — T5, `docs/pendencias.md`, cobre a
 * necessidade hoje) ou `gerarAPartirDeLiquidacao` (chamada por `LiquidacaoFinanceiraService`, nunca
 * exposta via HTTP). Toda Movimentação criada por qualquer um dos dois caminhos ganha, na mesma
 * transação, o Vínculo Conciliação obrigatório (Seção 4 de `14-vinculo-conciliacao.md`: "gerada
 * automaticamente ... para toda Movimentação Bancária que existir").
 */
@Service
@Transactional
public class MovimentacaoBancariaService {

    private static final Set<String> CLASSIFICACOES_VALIDAS = Set.of(
            "Terraplanagem", "Fora da Operação", "Transferência Interna", "Retirada do Patrão", "Não Classificada");

    private final MovimentacaoBancariaRepository repository;
    private final VinculoConciliacaoRepository vinculoConciliacaoRepository;
    private final ContaBancariaService contaBancariaService;

    public MovimentacaoBancariaService(MovimentacaoBancariaRepository repository,
                                        VinculoConciliacaoRepository vinculoConciliacaoRepository,
                                        ContaBancariaService contaBancariaService) {
        this.repository = repository;
        this.vinculoConciliacaoRepository = vinculoConciliacaoRepository;
        this.contaBancariaService = contaBancariaService;
    }

    public List<MovimentacaoBancaria> importar(UUID contaBancariaId, List<ItemImportacaoMovimentacao> itens) {
        if (itens == null || itens.isEmpty()) {
            throw new BusinessException("itens não pode ser vazio");
        }
        ContaBancaria contaBancaria = contaBancariaService.buscarPorId(contaBancariaId);

        List<MovimentacaoBancaria> importadas = new ArrayList<>();
        for (ItemImportacaoMovimentacao item : itens) {
            if (item.data() == null) {
                throw new BusinessException("data é obrigatória para cada movimentação importada");
            }
            if (item.descricao() == null || item.descricao().isBlank()) {
                throw new BusinessException("descricao é obrigatória para cada movimentação importada");
            }
            if (item.valor() == null) {
                throw new BusinessException("valor é obrigatório para cada movimentação importada");
            }
            importadas.add(criarComVinculoNaoVinculado(
                    new MovimentacaoBancaria(contaBancaria, item.data(), item.descricao(), item.valor())));
        }
        return importadas;
    }

    /**
     * Segundo caminho de criação previsto no documento de domínio: "gerada automaticamente ao registrar
     * uma Liquidação". Chamada por `LiquidacaoFinanceiraService#criar`, na mesma transação. A
     * correspondência com a Liquidação de origem já é certa por construção — o Vínculo Conciliação nasce
     * `Confirmado` diretamente, sem passar por `Sugerido` (que é para candidatas encontradas por
     * matching, não para este caso).
     *
     * Convenção de sinal (fora do escopo conceitual — Seção 2 de `12-movimentacao-bancaria.md`):
     * Pagamento é saída (valor negativo), Recebimento é entrada (valor positivo).
     */
    public MovimentacaoBancaria gerarAPartirDeLiquidacao(LiquidacaoFinanceira liquidacao) {
        var valor = "Pagamento".equals(liquidacao.getTipo()) ? liquidacao.getValor().negate() : liquidacao.getValor();
        String descricao = "Liquidação Financeira (" + liquidacao.getTipo() + ") — " + liquidacao.getId();
        MovimentacaoBancaria movimentacao = new MovimentacaoBancaria(
                liquidacao.getContaBancaria(), liquidacao.getDataEfetiva(), descricao, valor);
        movimentacao = repository.save(movimentacao);

        VinculoConciliacao vinculo = new VinculoConciliacao(movimentacao);
        vinculo.confirmarDiretamente(liquidacao);
        vinculoConciliacaoRepository.save(vinculo);

        return movimentacao;
    }

    public MovimentacaoBancaria reclassificar(UUID id, String novaClassificacao) {
        if (!CLASSIFICACOES_VALIDAS.contains(novaClassificacao)) {
            throw new BusinessException("classificacao inválida");
        }
        if (MovimentacaoBancaria.TRANSFERENCIA_INTERNA.equals(novaClassificacao)) {
            throw new BusinessException(
                    "classificacao 'Transferência Interna' só pode ser atribuída registrando uma Transferência Interna "
                            + "(POST /api/transferencias-internas) — não diretamente");
        }
        MovimentacaoBancaria movimentacao = buscarPorId(id);
        movimentacao.reclassificar(novaClassificacao);
        return repository.save(movimentacao);
    }

    @Transactional(readOnly = true)
    public MovimentacaoBancaria buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movimentação Bancária não encontrada: " + id));
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoBancaria> listarTodas() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<MovimentacaoBancaria> listarPorConta(UUID contaBancariaId) {
        return repository.findByContaBancariaId(contaBancariaId);
    }

    private MovimentacaoBancaria criarComVinculoNaoVinculado(MovimentacaoBancaria movimentacao) {
        movimentacao = repository.save(movimentacao);
        vinculoConciliacaoRepository.save(new VinculoConciliacao(movimentacao));
        return movimentacao;
    }
}
