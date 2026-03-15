# ADR: GO/NO-GO — Primeiro Cliente Externo

**Story 7.6 — AC-7**
**Data:** _(fill after self-dogfooding complete)_
**Status:** ⬜ Pendente → GO / NO-GO

---

## Contexto

Após a conclusão do self-dogfooding completo (Stories 7.1–7.5), esta decisão define se o CopyZen está pronto para aceitar o primeiro cliente externo pagante.

O modelo de negócio bootstrap exige que o sistema funcione de forma suficientemente autônoma para que Fernando possa operá-lo solo em paralelo com outras atividades.

---

## Critérios de GO (todos devem ser cumpridos)

| # | Critério | Status | Evidência |
|---|---------|--------|-----------|
| 1 | Mínimo 1 lead real capturado pelo FunWheel da CopyZen | ⬜ | `supabase: leads.count > 0 where client_id='...'` |
| 2 | Todos os 3 sistemas geraram output publicável sem bug crítico | ⬜ | Stories 7.2, 7.3, 7.4 completas |
| 3 | Custo por projeto Combo Cash < R$50 | ⬜ | `docs/metrics/self-dogfooding-report.md` |
| 4 | Qualidade aprovada por Fernando com ≤ 2 ciclos de revisão | ⬜ | Score médio ≥ 4/5 em story 7.2 |

---

## Critérios de NO-GO (qualquer um bloqueia)

| # | Situação | Ação |
|---|---------|------|
| A | 0 leads capturados em 2 semanas após publicação | Revisar copy FunWheel, testar com email/WhatsApp pessoal |
| B | Bug crítico em algum dos 3 sistemas | Documentar e corrigir antes de aceitar cliente |
| C | Custo > R$100 por projeto | Otimizar prompts, reduzir chamadas LLM |
| D | Score médio de qualidade < 3 | Revisar prompts CMO + Copywriter, adicionar exemplos |

---

## Decisão

**Data:** _____________________

**Decisor:** Fernando (operator)

**Decisão:** ⬜ GO &nbsp;&nbsp;&nbsp; ⬜ NO-GO

**Justificativa:**
_(fill)_

---

## Se GO: Próximos Passos

- [ ] Definir preço por pacote (`docs/business/pricing-v1.md`)
- [ ] Criar proposta para 1 cliente piloto (desconto de 50% como early adopter)
- [ ] Monitorar primeiro projeto como aprendizado
- [ ] Coletar depoimento para social proof na Sales Page

## Se NO-GO: Plano de Ação

- [ ] Identificar o(s) critério(s) que bloquearam
- [ ] Definir sprint de correção (2 semanas)
- [ ] Re-avaliar após correções

---

## Referências

- `docs/metrics/self-dogfooding-report.md` — dados completos
- `docs/business/pricing-v1.md` — análise de preços
- PRD §1 Goals: 1 cliente pagante externo em 4-5 meses
