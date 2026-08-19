package br.com.joaocerem.hvieira_financeiro.interfaces.http.conciliacaobancaria;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record VincularManualmenteRequest(@NotNull(message = "liquidacaoFinanceiraId é obrigatório") UUID liquidacaoFinanceiraId) {
}
