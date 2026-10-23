# ClyvoVet — QA Sprint 4

Compliance, Quality Assurance & Tests · Challenge FIAP 2026 · entrega até **04/11/2026**.

## Acesso à entrega

- **[Casos manuais no Azure Boards](https://dev.azure.com/clyvovet-fiap-2026-rm563298/ClyvoVet/_queries/query/8d652d1f-57a9-4c0b-a195-c3f47655fa9e/)** — 27 Test Cases, CT01 a CT27, IDs 63 a 89, na Sprint 4; 112 passos nativos. [Matriz de cobertura](docs/cobertura.md).
- **[Execução verificável no GitHub Actions](https://github.com/gabriel-g-dev/clyvovet-qa-sprint4/actions/runs/39963705016)** — executada em 23/10/2026, commit de automação `e544daad11bbbb56df92afe0a7900fd5b1cf3cdb`, com os três jobs aprovados.
- **[Auditoria dos cinco critérios da rubrica](docs/auditoria.md)** e [evidências, prints e relatórios](evidence/README.md).

**Vídeo demonstrativo: pendente de gravação e publicação pelo integrante responsável.**

A entrega fica na branch **develop**, também configurada como padrão, no [repositório público](https://github.com/gabriel-g-dev/clyvovet-qa-sprint4/tree/develop). O requisito de vídeo obrigatório permanece aberto; não há link de publicação informado.

## Resultado comprovado

| Verificação | Resultado |
|---|---|
| Plano manual | 27 Test Cases em Design, com 112 passos, entradas e saídas concretas |
| Cenários novos de sistema | 19 distintos: 9 via interface e 10 HTTP |
| Execução desktop | 19/19 — Chromium, 1440 × 900 |
| Execução em viewport mobile | 19/19 — painel Java no Chromium, 390 × 844 |
| Repetição desktop em ordem inversa | 19/19 — nova aplicação/H2, contextos UI independentes |
| Isolamento de dados | Zero pets de fixture restantes; pets e vacinas do seed inalterados nas três execuções |
| Regressão .NET preexistente | 131/131 unitários e 45/45 de integração SQLite |
| Planejamento original | 62 itens, 34 dependências e 58 relações de hierarquia preservados |
| Acesso docente | Felipe Braz Farias Santos: Basic na organização e Project administrator, conferido em 23/10/2026 |

Os casos manuais permanecem **planejados**, sem execução manual fictícia. CT20–CT22/CT26 não foram executados ponta a ponta em Oracle; CT23–CT25/CT27 não foram executados em Expo/Supabase. O viewport mobile acima valida o painel **Java**, não o aplicativo React Native. A inspeção visual continua registrando overflow do cabeçalho em 390 px.

## Escopo e ferramenta

O Java tem painel Thymeleaf e API REST próprios; a .NET é outro backend; o mobile usa Supabase. Nenhuma integração entre os três é pressuposta.

A automação usa **Playwright 1.62.1 com Chromium e assertions Node**, ferramenta equivalente de automação de navegador. Nove cenários atravessam a interface real; dez verificam os serviços HTTP reais. A suíte exercita autenticação, autorização, isolamento por tutor, dashboard, cadastro e validação de pets, histórico, score, aplicação de vacina, reforço e erros. Não usa interceptação de respostas nem mocks HTTP.

Cada cenário UI recebe um contexto novo. As fixtures são removidas, e o H2 exclusivo é descartado ao encerrar o processo. A repetição em ordem inversa verifica dependências entre cenários. As assertions anteriores foram preservadas e a comparação final do seed foi acrescentada. O GitHub Actions executa a preparação e a suíte; as verificações funcionais estão no código Playwright/Node. Os testes unitários existentes da .NET são contabilizados separadamente.

## Reproduzir

Pré-requisitos: **Java 17**, **Node 22**, Git, acesso ao Maven Central/npm e porta **18080** livre. Linux/macOS ou WSL/Git Bash no Windows. A pipeline usa Ubuntu 24.04 com bibliotecas do navegador já presentes, caches Maven/npm/Chromium e lockfile.

```bash
git clone --branch develop https://github.com/gabriel-g-dev/clyvovet-qa-sprint4.git
cd clyvovet-qa-sprint4
npm ci --ignore-scripts
npx playwright install chromium
npm run prepare:app
npm test
npm run test:mobile
npm run test:reverse
```

Em uma instalação Linux mínima sem as bibliotecas do Chromium, instalar uma única vez as dependências de sistema indicadas pelo Playwright (`npx playwright install-deps chromium`). Essa instalação não faz parte de cada execução da pipeline.

O script baixa o Java no commit fixado `c686580b6ae21c0e828a9057f8d5a5b53c94e254`, compila e inicia **sua própria instância local** em `127.0.0.1:18080`, com H2 em memória exclusivo e Java em UTC. O runner não recebe URL externa. Ao terminar, encerra a aplicação e descarta o banco. Uma nova execução recria o seed; não precisa restaurar Oracle.

Resultados em `artifacts/desktop/`, `artifacts/mobile/` e `artifacts/desktop-reverse/`: `report.html`, `results.json`, `application.log`, configuração efetiva e capturas PNG. Os scripts retornam erro em falha de preparação ou assertion. Para visualizar o navegador com interface gráfica disponível: `QA_HEADED=true npm test`.

As contas de demonstração Java são públicas no [README](https://github.com/gabriel-g-dev/clyvovet-java/blob/c686580b6ae21c0e828a9057f8d5a5b53c94e254/README.md) e no [seed Flyway](https://github.com/gabriel-g-dev/clyvovet-java/blob/c686580b6ae21c0e828a9057f8d5a5b53c94e254/src/main/resources/db/migration/V2__insert_mocks.sql). Nenhuma credencial de produção é necessária. JWTs e cabeçalhos Authorization não são escritos nas evidências. D é a data UTC capturada no início; nomes e valores das fixtures são predefinidos, e IDs são obtidos das respostas.

## Organização

- `automation/run.mjs`: 19 cenários e gerenciamento do ambiente descartável.
- `manual/`: casos, dados, passos, critérios e IDs reais no Azure.
- `docs/`: cobertura, inspeção, limitações e auditoria.
- `evidence/`: relatórios brutos, logs, capturas e ZIPs da execução; histórico técnico preservado separadamente.
- `.github/workflows/qa.yml`: reprodução desktop/mobile, repetição em ordem inversa e regressão .NET separada.

## Limites conhecidos

A [inspeção e os defeitos](docs/inspecao-e-defeitos.md) registram overflow do cabeçalho Java no celular, leituras públicas na .NET (PBI 33 ainda pendente), migrations .NET antigas e o risco da política de vacinas Supabase conferir `user_id` sem validar a propriedade de `pet_id`. CT27 verifica apenas agendamento local, com calendário estático, sem reserva clínica real. Os riscos por inspeção não são apresentados como falhas confirmadas por execução. Os repositórios Java, .NET e Mobile permanecem inalterados.
