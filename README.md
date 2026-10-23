# ClyvoVet — QA Sprint 4

Compliance, Quality Assurance & Tests · Challenge FIAP 2026 · entrega até **04/11/2026**.

## Acesso à entrega

- **[Casos manuais no Azure Boards](https://dev.azure.com/clyvovet-fiap-2026-rm563298/ClyvoVet/_queries/query/8d652d1f-57a9-4c0b-a195-c3f47655fa9e/)** — 25 Test Cases, CT01 a CT25, IDs 63 a 87, na Sprint 4. O índice completo está na [matriz de cobertura](docs/cobertura.md).
- **[Vídeo da automação](evidence/demonstracao.mp4)** — configuração utilizada, execução real no navegador e resultados individuais/gerais. Baixe o MP4 caso o GitHub não reproduza inline.
- **[Execução verificável no GitHub Actions](https://github.com/gabriel-g-dev/clyvovet-qa-sprint4/actions/runs/39641753093)** — fonte da evidência, com logs e artefatos.
- **[Auditoria da rubrica](docs/auditoria.md)** e [evidências](evidence/README.md).

A entrega fica na branch **develop**. O vídeo também pode ser baixado diretamente em [MP4](https://github.com/gabriel-g-dev/clyvovet-qa-sprint4/raw/refs/heads/develop/evidence/demonstracao.mp4).

Execução de referência realizada em **21/10/2026**. Auditoria final dos vínculos em **23/10/2026**.

## Resultado comprovado

| Verificação | Resultado |
|---|---|
| Plano manual | 25 Test Cases com 100 passos nativos, entradas e saídas concretas |
| Cenários novos de sistema | 19 implementados e aprovados |
| Execução desktop | 19/19 — Chromium, 1440 × 900 |
| Execução em tela de celular | 19/19 — Chromium, 390 × 844 |
| Regressão .NET preexistente | 131/131 unitários e 45/45 de integração SQLite |
| Inspeção visual | Cabeçalho Java com overflow em 390 px; defeito registrado |

**Aprovação funcional não significa ausência de defeitos visuais.** Os casos manuais permanecem planejados, sem execução manual fictícia. CT20–CT25 têm procedimentos completos, mas não foram executados ponta a ponta em Oracle/Expo/Supabase. A execução em tela de celular acima é do painel **Java**, não do aplicativo React Native.

## Escopo e ferramenta

O Java tem painel Thymeleaf e API REST próprios; a .NET é outro backend; o mobile usa Supabase. Nenhuma integração entre os três é pressuposta.

A automação usa **Playwright 1.62.1 com Chromium e assertions Node**, ferramenta equivalente de automação de navegador. Nove cenários atravessam a interface real; dez verificam os serviços HTTP reais. A suíte exercita autenticação, autorização, isolamento por tutor, dashboard, cadastro e validação de pets, histórico, score, aplicação de vacina, reforço e erros. Não usa interceptação de respostas nem mocks HTTP.

O Playwright foi escolhido por automatizar os formulários reais, capturar vídeo, controlar sessões isoladas e verificar a persistência pela API. O GitHub Actions executa a preparação e a suíte; **não é a ferramenta que substitui as assertions**. Os testes unitários existentes não são apresentados como os novos testes de sistema.

## Reproduzir

Pré-requisitos: **Java 17**, **Node 22**, Git, acesso ao Maven Central/npm e porta **18080** livre. Linux/macOS ou WSL/Git Bash no Windows.

```bash
git clone --branch develop https://github.com/gabriel-g-dev/clyvovet-qa-sprint4.git
cd clyvovet-qa-sprint4
npm install --ignore-scripts
npx playwright install --with-deps chromium
npm run prepare:app
npm test
npm run test:mobile
```

O script baixa o Java no commit fixado, compila e inicia **sua própria instância local** em `127.0.0.1:18080`, com H2 em memória exclusivo. Não configurar URL de produção: o runner não recebe uma URL externa. Ao terminar, encerra a aplicação e descarta o banco. Para repetir, execute `npm test` novamente; o seed é recriado. Não é necessário reiniciar manualmente ou restaurar Oracle.

Resultados: `artifacts/desktop/report.html`, `results.json`, capturas e vídeos individuais. A execução mobile grava em `artifacts/mobile/`. Os scripts retornam código diferente de zero em falha de setup ou assertion.

Para ver o navegador durante a execução:

```bash
QA_HEADED=true QA_DEMO=true npm test
```

Para montar o vídeo após a execução desktop (requer Python 3 e FFmpeg; no Linux usa DejaVu Sans):

```bash
python3 scripts/make-video.py artifacts/desktop
```

As credenciais `admin@clyvovet.com.br / admin123` e `gabriel@clyvovet.com.br / tutor123` são **públicas de demonstração**, definidas na massa Flyway do projeto. Nenhuma conta real ou chave de produção é necessária. A data D é capturada no início da execução em UTC; nomes e valores das fixtures estão predefinidos, e IDs são obtidos das respostas.

## Organização

- `automation/run.mjs`: 19 cenários e gerenciamento do ambiente descartável.
- `manual/`: casos, dados, passos, critérios e IDs reais no Azure.
- `docs/`: cobertura, inspeção, limitações e auditoria.
- `evidence/`: vídeo, relatórios brutos e arquivos compactados da execução.
- `.github/workflows/qa.yml`: reprodução desktop/mobile e regressão .NET separada.

## Limites conhecidos

A [inspeção e os defeitos](docs/inspecao-e-defeitos.md) registram overflow do cabeçalho Java no celular, leituras públicas na .NET (PBI 33 ainda pendente), migrations .NET antigas e o risco da política de vacinas Supabase conferir `user_id` sem validar a propriedade de `pet_id`. O risco Supabase ainda precisa de confirmação em execução. Não houve alteração dos repositórios das disciplinas nem tentativa de mascarar essas lacunas.
