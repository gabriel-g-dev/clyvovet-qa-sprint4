# ClyvoVet — QA Sprint 4

Testes de sistema do Challenge FIAP 2026 — Compliance, Quality Assurance & Tests.

[Azure Boards — plano de testes](https://dev.azure.com/clyvovet-fiap-2026-rm563298/ClyvoVet/_queries/query/8d652d1f-57a9-4c0b-a195-c3f47655fa9e/) · [27 roteiros manuais / 112 passos](manual/README.md) · [GitHub público — develop](https://github.com/gabriel-g-dev/clyvovet-qa-sprint4/tree/develop).

**Vídeo demonstrativo: gravação e publicação pendentes.**

## Execução

Requisitos: Linux ou WSL, Java 17, Node.js 22 ou superior, Git, Bash e porta 18080 livre. A preparação usa a aplicação Java no commit `8e1245351b5a6a6406d7de09edbcbdfbb288234d`. A suíte inicia a aplicação em loopback, com banco H2 novo e fuso UTC, e a encerra ao terminar.

```bash
npm ci --ignore-scripts
npx playwright install --with-deps --only-shell chromium
npm run prepare:app
npm test
npm run test:mobile
npm run test:reverse
```

Use `QA_CHROMIUM_EXECUTABLE` para indicar um Headless Shell compatível já instalado. Os resultados completos ficam em `artifacts/`, fora do Git.

## Resultados

Execuções locais com Java `8e12453`, Playwright 1.62.1 e Chromium Headless Shell 151.0.7922.34:

| Configuração | Aprovados | Falhas / bloqueios | Resultado original |
|---|---:|---:|---|
| Desktop 1440 × 900 | 19/19 | 0 / 0 | [JSON](evidence/java/desktop/results.json) |
| Viewport mobile 390 × 844 | 19/19 | 0 / 0 | [JSON](evidence/java/mobile/results.json) |
| Desktop em ordem inversa | 19/19 | 0 / 0 | [JSON](evidence/java/desktop-reverse/results.json) |

São **19 cenários distintos: 9 de interface e 10 HTTP, totalizando 57 execuções aprovadas**. Os JSONs registram configuração, versões, horários, resultados individuais e isolamento dos dados: seed preservado e nenhum pet de teste restante.

Capturas: [configuração](evidence/java/desktop/configuration.png), [resultado geral](evidence/java/desktop/report.png), [login válido](evidence/java/desktop/CT01.png), [login inválido](evidence/java/desktop/CT02.png), [formulário vazio](evidence/java/desktop/CT08.png), [aplicação/reforço](evidence/java/desktop/CT15.png) e [viewport mobile](evidence/java/mobile/CT15.png).

No GitHub Actions, a [execução 41855178048](https://github.com/gabriel-g-dev/clyvovet-qa-sprint4/actions/runs/41855178048) foi aprovada com **3/3 jobs**. O [workflow](.github/workflows/qa.yml) executa a suíte Java e, separadamente, a regressão .NET em `e80bfc0`. Esses resultados de regressão não validam a versão .NET publicada em `e0efef1`.

## Plano e pendências

A execução manual dos 27 casos está pendente. CT01–CT19 têm automação Java; CT20–CT22/CT26 (.NET, baseados em `e80bfc0`) e CT23–CT25/CT27 (Mobile `77b05a3`) aguardam execução ponta a ponta. O teste de viewport mobile cobre a aplicação Java, sem executar o Expo. Java, .NET e Mobile são aplicações independentes; esta validação não cobre integração entre elas nem execução com Oracle/MongoDB.

No Azure, o PBI14 foi salvo e os outros 16 PBIs ainda estão pendentes. Os Test Cases precisam de aprovação e atualização, mantendo IDs, vínculos com PBIs e passos.

As capturas da [consulta Azure](evidence/azure-qa-ct26-27.jpg) e do acesso do professor como [Basic](evidence/azure-professor-basic.jpg) e [administrador do projeto](evidence/azure-professor-admin.jpg) são registros anteriores. O acesso atual ainda precisa ser reconferido.

## Integrantes

| Nome | RM |
|---|---|
| Gabriel Garcia | 563298 |
| André Bellandi | 564662 |
| Vitor Augusto | 564227 |
