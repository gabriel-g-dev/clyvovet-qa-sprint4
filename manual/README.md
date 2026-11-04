# Plano de testes manuais

**27 casos, 112 passos, IDs Azure 63–89**, na Sprint 4 de QA. Cada roteiro contém objetivo, dados de entrada, resultados esperados, procedimento, critérios de aprovação, restauração e vínculo com o PBI e a sprint de origem.

[Plano no Azure Boards](https://dev.azure.com/clyvovet-fiap-2026-rm563298/ClyvoVet/_queries/query/8d652d1f-57a9-4c0b-a195-c3f47655fa9e/).

A execução manual e a atualização dos Test Cases no Azure estão pendentes. CT01–CT19 têm automação Java. Os [resultados e demais pendências](../README.md) estão no README do projeto.

## Preparação

- Java: prepare com `npm run prepare:app`. Para executar os casos manualmente, inicie a aplicação com o comando abaixo, use H2 novo por caso e encerre com Ctrl+C. Não execute a automação ao mesmo tempo na porta 18080.
- .NET: os roteiros usam `e80bfc0`; a versão publicada está no [README de e0efef1](https://github.com/gabriel-g-dev/ClyvoVetApi/blob/e0efef1/README.md). Use schema Oracle exclusivo, MongoDB descartável e a migration OracleBaseline, sem aplicar os scripts legados em conjunto.
- Mobile: use a [versão 77b05a3](https://github.com/Vitor-Augusto-olv/clyvo-ve/tree/77b05a31a1d5cc55b46ce84269d08346aeadff8a), uma instalação de QA com notificações habilitadas e Supabase exclusivo, preparado pelos scripts dos casos. Mantenha as contas e os dados sintéticos somente no QA, sem alterar o projeto compartilhado.

```bash
java -Duser.timezone=UTC -jar .work/java/target/clyvovet-0.0.1-SNAPSHOT.jar \
  --server.address=127.0.0.1 --server.port=18080 \
  '--spring.datasource.url=jdbc:h2:mem:qa_manual;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE'
```

`D` é a data UTC de início de cada caso Java/.NET. No Mobile, registre o horário `H` e a data `D` no fuso `America/Sao_Paulo`. Calcule e anote as datas derivadas antes de começar.

Guarde os IDs retornados no cliente de teste. Nos modelos JSON, substitua os marcadores de UUID, data e horário pelos valores capturados ou calculados; os demais textos são literais. Não publique tokens nas evidências.

## Casos

- [CT01 — ADMIN autentica e abre o dashboard](CT01.md) · PBI #24 · 3 passos
- [CT02 — Senha incorreta não cria sessão](CT02.md) · PBI #24 · 3 passos
- [CT03 — TUTOR lista somente Rex e suas pendências](CT03.md) · PBI #24 · 3 passos
- [CT04 — TUTOR recebe acesso negado em operação ADMIN](CT04.md) · PBI #24 · 3 passos
- [CT05 — Dashboard apresenta 2 pets e 3 vacinas pendentes](CT05.md) · PBI #25 · 3 passos
- [CT06 — Ficha do Rex exibe score 85 e ATENÇÃO](CT06.md) · PBI #26 · 3 passos
- [CT07 — ADMIN cadastra pet pela interface e dados persistem](CT07.md) · PBI #25 · 5 passos
- [CT08 — Formulário vazio mostra seis erros e não grava](CT08.md) · PBI #25 · 4 passos
- [CT09 — JWT identifica o tutor e bloqueia token ausente ou inválido](CT09.md) · PBI #24 · 4 passos
- [CT10 — Cadastro público fixa ROLE_TUTOR e rejeita e-mail repetido](CT10.md) · PBI #24 · 4 passos
- [CT11 — TUTOR não acessa Mel nem transfere pet por tutorId](CT11.md) · PBI #24 · 4 passos
- [CT12 — Pet percorre criação, filtro, edição e exclusão](CT12.md) · PBI #17 · 4 passos
- [CT13 — Histórico e preço da consulta respeitam o perfil TUTOR](CT13.md) · PBI #24 · 4 passos
- [CT14 — Score sem histórico é 40 e nunca fica abaixo de zero](CT14.md) · PBI #26 · 5 passos
- [CT15 — Baixa pela interface cria reforço e atualiza score](CT15.md) · PBI #27 · 5 passos
- [CT16 — Reaplicação retorna 409 sem criar nova dose](CT16.md) · PBI #27 · 5 passos
- [CT17 — Reforço previamente agendado não é duplicado](CT17.md) · PBI #27 · 4 passos
- [CT18 — Data futura retorna 400 sem aplicar nem criar reforço](CT18.md) · PBI #27 · 4 passos
- [CT19 — Erros 404 e data inválida mantêm contrato claro](CT19.md) · PBI #18 · 3 passos
- [CT20 — .NET autentica escrita e mantém histórico do pet](CT20.md) · PBI #16 · 5 passos
- [CT21 — .NET protege leitura sensível sem token (aceite Sprint 4)](CT21.md) · PBI #33 · 4 passos
- [CT22 — .NET distingue liveness e readiness de Oracle e MongoDB](CT22.md) · PBI #28 · 4 passos
- [CT23 — Mobile autentica, restaura sessão e protege logout](CT23.md) · PBI #30 · 4 passos
- [CT24 — Mobile mantém pets e isola dados entre duas contas](CT24.md) · PBI #31 · 5 passos
- [CT25 — Mobile mantém vacinas e medicamentos, notifica e isola os cuidados por pet](CT25.md) · PBI #31 · 5 passos
- [CT26 — .NET valida histórico clínico, evolução documental e score do pet](CT26.md) · PBI #16 · 8 passos
- [CT27 — Mobile persiste agendamento, rejeita duplicidade e limita cancelamento a 24h](CT27.md) · PBI #22 · 4 passos
