# Inspeção e defeitos — conferência em 23/10/2026

## Baseline inspecionada

| Frente | Commit | Implementação verificada no código |
|---|---|---|
| Java | c686580b6ae21c0e828a9057f8d5a5b53c94e254 | Spring Boot 3.3.5, Java 17, Thymeleaf, sessão web/JWT, H2/Flyway, escopo por tutor, inteligência preventiva e baixa com reforço |
| .NET | 83b6dd76b55e471d5f5344f60a80f3617f3f9928 | ASP.NET 9, Oracle, JWT em escrita, histórico, score, Serilog, OpenTelemetry e health checks; suítes próprias com SQLite |
| Mobile | bef537c330f281f17131c12f514d9839d2263b8a | Expo/React Native, Supabase Auth/Postgres/RLS, services e hooks TanStack Query para pets/vacinas |

Foram lidos README, configurações, controllers, DTOs, regras de score/baixa, seed Flyway, telas e services mobile, políticas RLS e testes existentes. A interface e a API Java foram executadas de verdade. A .NET teve suas suítes preexistentes executadas; isso não equivale a validar Oracle/Docker ou o app mobile.

## Cobertura anterior

Java: testes de perfil, registro de tutor, preço da consulta e baixa de vacina. .NET: 131 testes unitários e 45 de integração via WebApplicationFactory/SQLite. Mobile: package.json sem comando de testes e nenhuma suíte automatizada localizada. A entrega adiciona automação de sistema em outro repositório.

## Problemas e limitações

| ID | Evidência e impacto | Situação |
|---|---|---|
| QA-VIS01 | Em viewport 390 × 844, o cabeçalho Java excede a largura; a captura full page CT06 mede 699 px de largura e mostra elementos fora dos 390 px. [Captura](../evidence/mobile-CT06.png). | Defeito visual observado; não altera os resultados das assertions funcionais. Código da disciplina preservado. |
| QA-NET01 | GETs de PetsController/DonosController sem Authorize; README reconhece leituras públicas. Contraria o aceite do PBI 33. | Confirmado por inspeção; CT21 planejado, sem execução manual registrada. |
| QA-NET02 | Migrations descrevem modelagem antiga; DDL atual é script_bd.sql. | Limitação reconhecida no código/README; PBI 32 permanece pendente, sem mudança de estado. |
| QA-MOB01 | Política de INSERT/UPDATE de vacinas confere auth.uid()=user_id, mas não a propriedade do pet_id referenciado. | Risco por inspeção, não exploração confirmada. CT25 inclui tentativa controlada somente em Supabase QA. |
| QA-MOB02 | Status vacinal é calculado ao criar/editar; não é atualizado diariamente na leitura. | Limitação de implementação; não prometer recálculo automático apenas por abrir o app. |
| QA-MOB03 | Histórico contém eventos locais e agendamento usa AsyncStorage; não integra Java/.NET nem comprova atendimento clínico real. | Documentado como comportamento local; não incluído como persistência clínica na nuvem. |

CT27 cobre o agendamento local do PBI 22 (Sprint 2), com seleções explícitas e tentativa vazia; não foi executado em Expo. O calendário fixo 26/05 não demonstra uma vaga futura real.

Não foi usado o Supabase compartilhado para criar dados: faltava identificação de ambiente descartável e contas de QA confirmadas. O roteiro manual especifica esses pré-requisitos sem publicar tokens ou credenciais reais.

## Rastreabilidade e preservação

Inventário original: 4 Epics, 8 Features, 23 PBIs e 27 Tasks. Foram conferidas **34 dependências e 58 relações de hierarquia**. A referência está em baseline-boards.json e baseline-summary.json; os testes novos só adicionam vínculos de cobertura, sem criar dependências Predecessor/Successor ou alterar as Sprints originais.

O professor Felipe Braz continua Basic e consta como administrador do projeto. Nenhuma permissão, licença, billing ou organização foi alterada.
