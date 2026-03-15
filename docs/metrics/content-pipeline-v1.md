# Content Pipeline v1 — Metrics (CopyZen Self-Dogfooding)

**Story 7.2 — AC-5, AC-7**

## Execution Summary

| Field | Value |
|-------|-------|
| Client | CopyZen (client_id: 00000000-0000-0000-0000-000000000001) |
| Date | _(fill after live run)_ |
| Pipeline | `content-generation-pipeline` (n8n) |
| Package | Combo Cash — Sistema 1 (content) |
| Posts Generated | 5 (3 Inception + 2 Atração Fatal) |

---

## Post Inventory

| # | Mode | Format | Title/Topic | Score (1-5) | Issues |
|---|------|--------|------------|------------|--------|
| 1 | inception | carousel | _(fill after run)_ | — | — |
| 2 | inception | image | _(fill after run)_ | — | — |
| 3 | inception | carousel | _(fill after run)_ | — | — |
| 4 | atracao_fatal | carousel | _(fill after run)_ | — | — |
| 5 | atracao_fatal | image | _(fill after run)_ | — | — |

---

## Performance Metrics

### Timing
| Phase | Duration |
|-------|----------|
| CMO analysis | _(ms)_ |
| Copy generation (5 posts) | _(ms)_ |
| Image prompt generation | _(ms)_ |
| Total pipeline | _(ms)_ |

### Token Usage
_Query from Supabase:_
```sql
SELECT
  SUM(input_tokens) AS total_input,
  SUM(output_tokens) AS total_output,
  COUNT(*) AS llm_calls
FROM llm_usage_log
WHERE client_id = '00000000-0000-0000-0000-000000000001'
  AND created_at >= '<run_start_timestamp>';
```

| Metric | Value |
|--------|-------|
| Input tokens | _(fill)_ |
| Output tokens | _(fill)_ |
| Total LLM calls | _(fill)_ |
| Estimated cost (USD) | _(fill — input: $3/1M, output: $15/1M sonnet)_ |

### Iterations
| Metric | Value |
|--------|-------|
| CMO revision cycles | _(0 = first pass accepted)_ |
| Copywriter revisions | _(count)_ |
| Total revisions | _(sum)_ |

---

## Quality Review (Fernando)

### Evaluation Criteria (1-5)
- **1**: Não publicável — requer reescrita completa
- **2**: Precisou de >50% de edição manual
- **3**: Publicável após edição moderada (30 min)
- **4**: Publicável após ajustes menores (< 10 min)
- **5**: Publicável sem edições

### Results
| Post # | Score | Main Issues | Resolution |
|--------|-------|------------|------------|
| 1 | — | — | — |
| 2 | — | — | — |
| 3 | — | — | — |
| 4 | — | — | — |
| 5 | — | — | — |

**Average Score**: — / 5

---

## Google Drive Delivery

| Folder | Contents |
|--------|----------|
| `/CopyZen/Sistema 1 - Conteúdo/Posts/` | 5 posts (copy + image prompts) |
| `/CopyZen/Sistema 1 - Conteúdo/Aprovados/` | Posts after Fernando review |

---

## AC-6 Compliance: Posts publicáveis sem >1 ciclo de revisão

- [ ] Todos os 5 posts com score ≥ 4 após no máximo 1 ciclo
- [ ] Se score médio < 3 → documentar como issue de qualidade para v2

---

## Issues & Observations

_(fill after live run)_

---

## Success Criteria

- [x] Pipeline de código testado com MockLLMProvider (unit tests)
- [ ] Pipeline executado com API real → 5 posts gerados
- [ ] Posts entregues no Google Drive com estrutura de pastas correta
- [ ] Quality review por Fernando com score médio ≥ 4
- [ ] Custo total documentado e dentro do esperado
