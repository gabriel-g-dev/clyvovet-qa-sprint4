# Auditoria final — QA Sprint 4

Conferência em 23/10/2026, entrega até 04/11/2026. Execução de referência da automação: 21/10/2026, [run 39641753093](https://github.com/gabriel-g-dev/clyvovet-qa-sprint4/actions/runs/39641753093).

## Casos manuais — componente de 80 pontos

| Critério | Evidência verificável |
|---|---|
| Casos no Azure DevOps | 25 Test Cases reais, IDs 63–87, na [consulta compartilhada](https://dev.azure.com/clyvovet-fiap-2026-rm563298/ClyvoVet/_queries/query/8d652d1f-57a9-4c0b-a195-c3f47655fa9e/) |
| Identificação e objetivo | CT01–CT25, objetivo e rastreabilidade descritos individualmente |
| Pré-condições e entradas | Commit/ambiente, sessão/perfil, massa e valores concretos; D relativo ao dia UTC da execução |
| Passos e saídas | 100 passos nativos, cada um com ação e resultado esperado; conteúdo relido após salvar |
| Critério de aprovação | Todos os resultados dos passos devem ser observados; divergência reprova |
| Vínculo com desenvolvimento | 25 relações nativas Tests / Tested By para os PBIs correspondentes |
| Sprint e abrangência | Casos na Sprint 4, com Sprint de origem da funcionalidade documentada; Java, .NET e mobile cobertos no planejamento |
| Repetibilidade | Ambiente QA e restauração definidos em cada caso; nenhuma limpeza em produção |

Os 25 casos estão em Design e sua execução manual está **planejada**. A documentação não transforma a execução automatizada em execução manual. O acesso Basic observado permite os itens Test Case em Boards, mas não o fluxo completo de Test Plans; não foi ativado trial nem alterada licença. O professor Felipe Braz Farias Santos foi conferido em 21/10/2026 com acesso Basic e como Project administrator; as permissões não foram modificadas.

## Automação — componente de 20 pontos

| Critério | Evidência verificável |
|---|---|
| Ferramenta equivalente | Playwright 1.62.1 / Chromium, assertions Node e aplicação Java real em H2 privado |
| Cenários | 19 distintos: 9 via interface e 10 HTTP; referência em [cobertura](cobertura.md) |
| Execução e resultados | 19/19 desktop e 19/19 em viewport de celular; 38 execuções dos mesmos 19 cenários |
| Vídeo | [MP4 real](../evidence/demonstracao.mp4), configuração, nove fluxos UI e relatório individual/geral |
| Reproduzir e inspecionar | README, workflow, código, relatórios JSON, capturas, vídeos individuais e logs nos ZIPs |
| Regressão adicional | 131 unitários e 45 integrações SQLite da .NET, preexistentes e contabilizados separadamente |

A execução 39639520637 falhou em duas assertions do contrato de data; o runner foi corrigido e o histórico foi mantido. A execução final 39641753093 concluiu os três jobs com sucesso. O vídeo é uma montagem identificada de capturas reais dessa execução, sem simular ações ou resultados.

## Preservação do projeto

Foram relidos os **62 itens originais**. A comparação com a baseline não encontrou diferenças em títulos, descrições, critérios de aceite, estados ou iterações. Todas as **34 dependências** e **58 relações de hierarquia** permanecem. A alteração dos itens originais consiste nos 25 novos vínculos Tested By; não foram criadas dependências artificiais. Veja [baseline](baseline-boards.json), [relações iniciais](baseline-summary.json) e [resultado da comparação](audit-results.json).

Os três repositórios de disciplinas permanecem sem alterações locais. As mudanças de QA estão somente no repositório de entrega e nos novos Test Cases/vínculos/consulta do Azure.

## Limitações que afetam o aceite

- CT20–CT25 não foram executados ponta a ponta em Oracle/Expo/Supabase. Seus procedimentos exigem ambiente QA descartável e contas de teste.
- Viewport 390×844 valida o painel Java; não representa teste nativo do app mobile.
- O overflow do cabeçalho Java foi observado nas capturas e registrado como QA-VIS01.
- Leituras públicas e migrations da .NET, além do risco de integridade/RLS do Supabase, estão descritos em [inspeção e defeitos](inspecao-e-defeitos.md), com distinção entre observação e análise estática.
- A cobertura cobre os fluxos selecionados e não garante ausência de outros defeitos. A pontuação final depende da avaliação docente.
