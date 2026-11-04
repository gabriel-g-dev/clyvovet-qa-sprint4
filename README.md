# ClyvoVet — QA Sprint 4

Testes de sistema do Challenge FIAP 2026 — Compliance, Quality Assurance & Tests.

[Azure Boards — plano de testes](https://dev.azure.com/clyvovet-fiap-2026-rm563298/ClyvoVet/_queries/query/8d652d1f-57a9-4c0b-a195-c3f47655fa9e/) · [27 roteiros manuais / 112 passos](manual/README.md) · [GitHub público — develop](https://github.com/gabriel-g-dev/clyvovet-qa-sprint4/tree/develop).

**Vídeo demonstrativo: pendente de gravação e publicação pelo integrante responsável.**

## Execução

Ambiente de execução: Linux ou WSL, Java 17, Node.js 22 ou superior, Git, Bash e porta 18080 livre. A preparação obtém o Java `8e1245351b5a6a6406d7de09edbcbdfbb288234d`. A suíte inicia sua própria instância em loopback, com H2 novo e UTC, e a encerra ao terminar.

```bash
npm ci --ignore-scripts
npx playwright install --with-deps --only-shell chromium
npm run prepare:app
npm test
npm run test:mobile
npm run test:reverse
```

Se necessário, `QA_CHROMIUM_EXECUTABLE` informa o caminho do Headless Shell compatível já instalado. Resultados completos são gerados em `artifacts/`, fora do Git. O [workflow](.github/workflows/qa.yml) reproduz a suíte Java e mantém a regressão .NET separada; sua versão atual ainda não foi executada no GitHub.

## Resultados

Execuções locais de **04/11/2026**, Java `8e12453`, Playwright 1.62.1 e Chromium Headless Shell 151.0.7922.34:

| Configuração | Aprovados | Falhas / bloqueios | Resultado original |
|---|---:|---:|---|
| Desktop 1440 × 900 | 19/19 | 0 / 0 | [JSON](evidence/java/desktop/results.json) |
| Viewport mobile 390 × 844 | 19/19 | 0 / 0 | [JSON](evidence/java/mobile/results.json) |
| Desktop em ordem inversa | 19/19 | 0 / 0 | [JSON](evidence/java/desktop-reverse/results.json) |

São **19 cenários distintos: 9 de interface e 10 HTTP, totalizando 57 execuções aprovadas**. Os JSONs preservam configuração, versão, horários, resultados individuais e isolamento: seed inalterado e nenhum pet de fixture restante. CT10 mantém senha curta, perfil e duplicidade; CT17 verifica o reforço existente sem duplicação.

Capturas: [configuração](evidence/java/desktop/configuration.png), [resultado geral](evidence/java/desktop/report.png), [login válido](evidence/java/desktop/CT01.png), [login inválido](evidence/java/desktop/CT02.png), [formulário vazio](evidence/java/desktop/CT08.png), [aplicação/reforço](evidence/java/desktop/CT15.png) e [viewport mobile](evidence/java/mobile/CT15.png).

## Plano e pendências

Cada roteiro define objetivo, entradas, saídas, procedimento, restauração e vínculo com PBI/sprint. A execução manual dos 27 casos permanece planejada. CT01–CT19 possuem a automação Java acima; CT20–CT22/CT26 (.NET `e80bfc0`) e CT23–CT25/CT27 (Mobile `77b05a3`) não foram executados ponta a ponta. Viewport mobile Java não executa Expo. Java, .NET e Mobile são aplicações independentes; não se declara integração entre elas nem execução de Oracle/MongoDB nesta validação.

[Consulta Azure](evidence/azure-qa-ct26-27.jpg), [professor Basic](evidence/azure-professor-basic.jpg) e [administrador do projeto](evidence/azure-professor-admin.jpg) são capturas de **23/10/2026**. Os roteiros atuais ainda precisam de aprovação e atualização no Azure, preservando IDs, PBIs e 112 passos; o acesso docente precisa ser reconferido. A publicação das alterações na develop e o vídeo obrigatório permanecem pendentes. Não há nova execução do Actions atribuída aos resultados locais.

## Integrantes

| Nome | RM |
|---|---|
| Gabriel Garcia | 563298 |
| André Bellandi | 564662 |
| Vitor Augusto | 564227 |
