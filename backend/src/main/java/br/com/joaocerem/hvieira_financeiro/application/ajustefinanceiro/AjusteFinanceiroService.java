package br.com.joaocerem.hvieira_financeiro.application.ajustefinanceiro;

import br.com.joaocerem.hvieira_financeiro.application.lancamentofinanceiro.LancamentoFinanceiroService;
import br.com.joaocerem.hvieira_financeiro.application.usuario.UsuarioService;
import br.com.joaocerem.hvieira_financeiro.common.exception.BusinessException;
import br.com.joaocerem.hvieira_financeiro.common.exception.ResourceNotFoundException;
import br.com.joaocerem.hvieira_financeiro.common.validation.Validacoes;
import br.com.joaocerem.hvieira_financeiro.domain.ajustefinanceiro.AjusteFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.ajustefinanceiro.AjusteFinanceiroRepository;
import br.com.joaocerem.hvieira_financeiro.domain.lancamentofinanceiro.LancamentoFinanceiro;
import br.com.joaocerem.hvieira_financeiro.domain.usuario.Usuario;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Casos de uso de Ajuste Financeiro. Ver `docs/domain-model/15-ajuste-financeiro.md`.
 *
 * Único caso de uso de escrita é `criar` — a entidade é totalmente imutável desde a criação (D13,
 * decisão #34), sem `atualizar` nem exclusão física (`arquitetura-fisica-banco.md` §7, "nada
 * desaparece", formalmente confirmada para esta entidade).
 *
 * `lancamentoAjusteId` **não é criado por este Service** — o documento de `LANÇAMENTO_FINANCEIRO`
 * (Seção 1, "Quem cria") não lista Ajuste Financeiro como criador de Lançamento, e `origem` de
 * Lançamento não tem valor "Ajuste Financeiro" no schema (`ck_lancamentos_financeiros_origem`). O
 * fluxo correto é: o usuário cria o Lançamento de ajuste separadamente (via
 * `POST /api/lancamentos-financeiros`, origem "Manual"), e só então formaliza o vínculo aqui.
 *
 * M8 (Ajuste-de-Ajuste, `pendencias.md`, Melhorias Futuras) permanece pendência distinta e não
 * resolvida — este Service não impõe nenhuma restrição sobre um `lancamentoOriginal` que já seja, ele
 * mesmo, um `lancamentoAjuste` de outro Ajuste, nem exige o contrário; nenhuma regra é inventada aqui.
 */
@Service
@Transactional
public class AjusteFinanceiroService {

    private static final Set<String> TIPOS_AJUSTE_VALIDOS = Set.of("Estorno", "Reembolso", "Crédito", "Ajuste");

    private final AjusteFinanceiroRepository repository;
    private final LancamentoFinanceiroService lancamentoFinanceiroService;
    private final UsuarioService usuarioService;

    public AjusteFinanceiroService(AjusteFinanceiroRepository repository,
                                    LancamentoFinanceiroService lancamentoFinanceiroService,
                                    UsuarioService usuarioService) {
        this.repository = repository;
        this.lancamentoFinanceiroService = lancamentoFinanceiroService;
        this.usuarioService = usuarioService;
    }

    public AjusteFinanceiro criar(UUID lancamentoOriginalId, UUID lancamentoAjusteId, String tipoAjuste,
                                   BigDecimal valor, LocalDate data, UUID usuarioId, String observacao) {
        validarTipoAjuste(tipoAjuste);
        Validacoes.exigirValorMonetarioPositivo(valor, "valor");
        if (lancamentoOriginalId.equals(lancamentoAjusteId)) {
            throw new BusinessException("lancamentoOriginalId e lancamentoAjusteId devem ser Lançamentos distintos");
        }

        LancamentoFinanceiro lancamentoOriginal = lancamentoFinanceiroService.buscarPorId(lancamentoOriginalId);
        LancamentoFinanceiro lancamentoAjuste = lancamentoFinanceiroService.buscarPorId(lancamentoAjusteId);
        if (lancamentoOriginal.estaCancelado()) {
            throw new BusinessException("lancamentoOriginal está Cancelado — não pode ser objeto de Ajuste Financeiro");
        }
        if (lancamentoAjuste.estaCancelado()) {
            throw new BusinessException("lancamentoAjuste está Cancelado — não pode formalizar um Ajuste Financeiro");
        }
        Usuario usuario = usuarioService.buscarPorId(usuarioId);

        return repository.save(new AjusteFinanceiro(lancamentoOriginal, lancamentoAjuste, tipoAjuste, valor, data, usuario, observacao));
    }

    @Transactional(readOnly = true)
    public AjusteFinanceiro buscarPorId(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ajuste Financeiro não encontrado: " + id));
    }

    @Transactional(readOnly = true)
    public List<AjusteFinanceiro> listarTodos() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<AjusteFinanceiro> listarPorLancamentoOriginal(UUID lancamentoOriginalId) {
        return repository.findByLancamentoOriginalId(lancamentoOriginalId);
    }

    private void validarTipoAjuste(String tipoAjuste) {
        if (!TIPOS_AJUSTE_VALIDOS.contains(tipoAjuste)) {
            throw new BusinessException("tipoAjuste deve ser um de: Estorno, Reembolso, Crédito, Ajuste");
        }
    }

}
