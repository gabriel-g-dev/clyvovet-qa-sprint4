# Auditoria da rubrica — QA Sprint 4

Conferência: **23/10/2026**. Prazo informado: **04/11/2026**. Referência: os dois prints oficiais fornecidos pelo integrante, lidos integralmente. Esta matriz informa evidência e lacunas; os pesos são da rubrica, não uma nota atribuída.

## Cinco critérios de avaliação

| Critério oficial | Peso | Situação comprovada | Evidência e limite |
|---|---:|---|---|
| Testes planejados e objetivos | 20 | Documentado, 27/27 no Azure | CT01–CT27 únicos, objetivos específicos, IDs 63–89, Design/Sprint 4. [Consulta](https://dev.azure.com/clyvovet-fiap-2026-rm563298/ClyvoVet/_queries/query/8d652d1f-57a9-4c0b-a195-c3f47655fa9e/), [cobertura](cobertura.md). Execução manual permanece planejada. |
| Dados de entrada por teste | 20 | Documentado, 27/27 | Perfis, campos/valores concretos, seed/fixtures, IDs retornados, D/UTC e restauração. CT26 define os sete recursos; CT27 define seleções e tentativa vazia. Credenciais publicamente fictícias, ambiente QA isolado. [Casos](../manual/README.md). |
| Dados de saída por teste | 20 | Documentado, 27/27 | Status HTTP, campos, contagens, mensagens e efeitos persistidos ou recusados. Cada um dos 112 passos tem saída verificável; expectativa não é resultado executado. [Verificação](casos-verificados.json). |
| Procedimento de teste | 20 | Documentado, 112/112 passos nativos | Pré-condições, ações reproduzíveis, aprovação e limpeza. Conteúdo relido na UI, comparado com cópia versionada; CT26/CT27 reconferidos. [Print CT26](../evidence/azure-ct26-steps.jpg), [CT27](../evidence/azure-ct27-steps.jpg). |
| Automação e evidência em vídeo da preparação/configuração, execução e resultados | 20 | Automação validada; **critério pendente pelo vídeo** | 19 cenários reais, 9 UI + 10 HTTP, acima do mínimo de 4. Desktop 19/19, mobile 19/19 e repetição inversa 19/19. Prints, logs, JSON e HTML disponíveis. O vídeo obrigatório será gravado/narrado/publicado pelo integrante; este critério não é declarado concluído. |

**Vídeo demonstrativo: pendente de gravação e publicação pelo integrante responsável.**

A Parte A solicita um plano de sistema no Azure Boards. Não exige transformar casos planejados em resultados fictícios. CT20–CT22/CT26 seguem sem execução Oracle e CT23–CT25/CT27 sem execução Expo/Supabase. Portanto, a documentação desses fluxos está pronta, mas seu comportamento ponta a ponta não foi comprovado nesta entrega.

## Penalidades e forma de entrega

| Exigência dos prints | Conferência | Risco restante |
|---|---|---|
| Dados controlados e aderência ao release/sprints; penalidade indicada de 10% por desrespeito | Valores e resultados predefinidos por caso; D registrado em UTC; fixtures QA; Sprint de origem documentada. CT27 corrigido para PBI 22. 62 itens e relações originais preservados. | Execuções manuais e ambientes Oracle/Expo não comprovados; não apresentar previsão como aprovação. Nenhuma penalidade é arbitrariamente calculada nesta auditoria. |
| Azure acessível ao docente, Basic na organização e administrador do projeto | Felipe Braz Farias Santos conferido na UI em 23/10/2026. [Basic](../evidence/azure-professor-basic.jpg), [Project administrators](../evidence/azure-professor-admin.jpg). | Acesso depende da conta já cadastrada do professor; não foram alteradas permissões, licenças ou Billing. |
| GitHub público, branch develop e link direto do Azure | Confirmado público, branch padrão develop; README contém consulta compartilhada e instruções. | Nenhum desvio identificado nesses itens na conferência. |
| Link do vídeo que demonstre configuração/execução; penalidade indicada de 10% por formato | Pendente de gravação/publicação pelo integrante. | **Requisito de formato ainda incompleto.** Há risco de perda na Parte B e da penalidade de formato enquanto faltar o link. A aplicação e eventual acumulação de descontos dependem do professor. |

Não se declara 100/100 nem conclusão integral. Prints e relatórios sustentam a parte técnica; não substituem o vídeo explicitamente exigido.

## Execução e reprodutibilidade

Execução nova [39963705016](https://github.com/gabriel-g-dev/clyvovet-qa-sprint4/actions/runs/39963705016), commit `e544daad11bbbb56df92afe0a7900fd5b1cf3cdb`, **23/10/2026**. Fonte Java `c686580b6ae21c0e828a9057f8d5a5b53c94e254`.

| Execução | Resultado | Evidência |
|---|---:|---|
| Desktop 1440 × 900 | 19/19, zero falhas | [JSON](../evidence/desktop-results.json), [ZIP HTML/PNG/logs](../evidence/desktop.zip) |
| Viewport mobile 390 × 844 do Java | 19/19, zero falhas | [JSON](../evidence/mobile-results.json), [ZIP](../evidence/mobile.zip) |
| Desktop inverso, outra aplicação e outro H2 | 19/19, zero falhas | [JSON](../evidence/desktop-reverse-results.json), pasta desktop-reverse no ZIP desktop |
| .NET preexistente | 131 unitários + 45 integrações SQLite, zero falhas/skips | [TRX](../evidence/regressao-dotnet.zip), [log](../evidence/dotnet-actions.log) |

São **19 cenários distintos**, 57 execuções, não 57 cenários. Os 176 testes preexistentes .NET são separados. As 65 chamadas de assertion anteriores foram mantidas; duas comparações de integridade do seed foram acrescentadas. CT04 mantém a assertion de que a operação proibida não altera a dose. Em todas as três execuções: nenhum pet QA residual, pets/vacinas do seed inalterados, contexto novo para cada caso UI. A execução inversa passou sem depender da sequência normal.

O timeout anterior ocorreu na instalação de pacotes do sistema antes da suíte desktop. A preparação agora usa Ubuntu 24.04 fixo, lockfile, caches Maven/npm/Chromium e execução headless; a reinstalação ampla via apt deixou de fazer parte do job. Os logs atuais confirmam restauração dos caches e conclusão da preparação/execução. Não houve mudança nas assertions para forçar aprovação. O teste inicia seu Java/H2 em loopback e encerra ao fim.

## Preservação e rastreabilidade

Foram relidos os 62 itens originais: 4 Epics, 8 Features, 23 PBIs e 27 Tasks. A comparação com a baseline não encontrou alterações em títulos, descrições, critérios de aceite, estados, iterações ou relações de planejamento. Permanecem **34 dependências e 58 hierarquias**. São **27 relações Tests / Tested By**, uma por caso; CT27 usa o PBI 22 (Sprint 2), CT26 o PBI 16 (Sprint 1). As listas de relações extensas foram expandidas antes de contabilizar, evitando contar apenas as linhas materializadas na interface.

[Baseline](baseline-boards.json), [relações iniciais](baseline-summary.json), [resultado](audit-results.json), [casos relidos](casos-verificados.json). Consulta compartilhada: 27 Test Cases, sem duplicatas de CT/ID. Total do projeto: 62 itens originais + 27 Test Cases = 89.

Os commits `47de343`, `6e87008` e `3079b84` permanecem ancestrais de develop. As remoções posteriores são commits normais, sem reescrever histórico ou fazer force push. Resultados técnicos anteriores foram preservados em [histórico](../evidence/history/39641753093/); execuções anteriores do Actions continuam disponíveis. Nenhum resultado antigo é rotulado como execução atual. Os repositórios Java, .NET e Mobile permanecem sem alterações e nos commits descritos na [inspeção](inspecao-e-defeitos.md).

## Segurança das evidências

As contas Java são públicas no [README da aplicação](https://github.com/gabriel-g-dev/clyvovet-java/blob/c686580b6ae21c0e828a9057f8d5a5b53c94e254/README.md) e no [seed](https://github.com/gabriel-g-dev/clyvovet-java/blob/c686580b6ae21c0e828a9057f8d5a5b53c94e254/src/main/resources/db/migration/V2__insert_mocks.sql). Os valores .NET `QaLocal123!` e `QaOnlySigningKey_ClyvoVet_2026_32_chars`, e as contas `example.test` mobile, são massa sintética explicitamente definida para um ambiente QA descartável. Não são valores obtidos de produção. Connection strings reais ficam somente no ambiente, sem conteúdo na entrega.

URLs `dev.azure.com/.../_workitems/edit/...` e da consulta são navegação, não tokens. As evidências não registram JWT, cabeçalhos Authorization nem cookies da sessão. Os ZIPs, logs e arquivos textuais foram examinados para padrões de chaves privadas, PAT GitHub, access keys AWS e JWTs completos, sem achados. A verificação tem esse escopo e não equivale a certificação de ausência de qualquer segredo. [Manifesto e proveniência](../evidence/provenance.json), [hashes](../evidence/sha256.json).

## Pendências e problemas objetivos

1. **Gravar, narrar e publicar o vídeo obrigatório e incluir seu link no README** — responsabilidade do integrante. Esta é a única ação pendente relacionada ao vídeo.
2. **Execução manual Oracle/Expo/Supabase** — não realizada; depende de ambientes QA descartáveis identificados. O plano está documentado, sem declaração de aprovação desses casos.
3. **Defeitos/limitações do produto** — overflow Java observado, leituras .NET públicas e migrations antigas identificadas por inspeção, risco RLS de vacinas Supabase ainda não confirmado em execução, calendário/agendamento mobile local. [Detalhes](inspecao-e-defeitos.md). Correções de produto estão fora da autorização de alterar apenas QA.

A evidência automática de referência e a documentação estão consistentes com os resultados acima. O aceite integral da disciplina permanece pendente do requisito de vídeo e da avaliação docente.
