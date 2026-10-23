# Evidências reais

Execução de referência: [39963705016](https://github.com/gabriel-g-dev/clyvovet-qa-sprint4/actions/runs/39963705016) · **23/10/2026** · branch develop · QA `e544daad11bbbb56df92afe0a7900fd5b1cf3cdb` · aplicação Java `c686580b6ae21c0e828a9057f8d5a5b53c94e254`.

| Artefato | Conteúdo |
|---|---|
| [desktop.zip](desktop.zip) | Artefato original do Actions: desktop normal e desktop-reverse; report.html, JSON, capturas e logs; extrair tudo para abrir HTML |
| [mobile.zip](mobile.zip) | Artefato original do Actions: painel Java em 390 × 844, HTML/JSON/PNG/logs |
| [regressao-dotnet.zip](regressao-dotnet.zip) | TRX originais: 131 unitários e 45 integrações SQLite aprovados, zero skips |
| [desktop-results.json](desktop-results.json), [mobile-results.json](mobile-results.json), [desktop-reverse-results.json](desktop-reverse-results.json) | Resultado individual, duração, status HTTP, eventos do navegador e verificação de isolamento |
| [desktop-actions.log](desktop-actions.log), [mobile-actions.log](mobile-actions.log), [dotnet-actions.log](dotnet-actions.log) | Logs reais dos três jobs; restauração dos caches, preparação e resultados |
| [Relatório desktop](desktop-report.png), [mobile](mobile-report.png), [inverso](desktop-reverse-report.png) | Capturas dos HTML gerados com resultados reais dos 19 casos |
| [Configuração desktop](desktop-configuration.png), [mobile](mobile-configuration.png), [inverso](desktop-reverse-configuration.png) | Capturas da configuração efetivamente executada, versões, commit, viewport e isolamento |
| [desktop-CT15.png](desktop-CT15.png) | Dose aplicada, reforço e score 100 na execução atual |
| [mobile-CT06.png](mobile-CT06.png) | Score 85 de Rex e overflow observado do cabeçalho |
| [Azure: consulta 27 casos](azure-qa.jpg), [CT26/CT27 na consulta](azure-qa-ct26-27.jpg) | Prints reais de 23/10/2026; plano em Design |
| [CT26: passos](azure-ct26-steps.jpg), [CT27: passos](azure-ct27-steps.jpg), [CT27: vínculo](azure-ct27-link.jpg) | Ações/saídas nativas e relação Tests com PBI 22 |
| [Professor Basic](azure-professor-basic.jpg), [administrador](azure-professor-admin.jpg) | Acesso já existente, sem alteração de licença/permissão |
| [GitHub Actions](github-actions.jpg), [repositório](repositorio-qa.jpg) | Estado publicado e execução aprovada |
| [Proveniência](provenance.json), [SHA-256](sha256.json) | Origem, integridade e escopo das verificações |
| [Histórico técnico de 21/10/2026](history/39641753093/) | Resultados anteriores preservados, sem confundir com a referência atual |

São **19 cenários distintos**, executados em desktop, mobile e ordem inversa: **57 execuções aprovadas**. Nenhum dos 176 testes preexistentes .NET é somado aos novos cenários. Os três JSON atuais comprovam isolamento aprovado, zero pets de fixture restantes e seed inalterado.

Os ZIPs atuais são cópias byte a byte dos artefatos da execução de referência; seus SHA-256 foram comparados com os digests retornados pelo GitHub. O histórico preserva assertions/resultados, logs e screenshots; apenas arquivos exclusivos de apresentação e seus campos/links foram retirados. Os resultados anteriores de 17/19 e as correções de contrato continuam no histórico Git/Actions; não são usados como resultado final.

O 403 em CT04 é esperado. Não houve erro JavaScript, 404 de recurso estático ou 5xx que passe silenciosamente nas assertions. QA-VIS01 continua documentado. Não há JWT ou chave de produção nas evidências. As credenciais de demonstração têm origem pública ou são valores sintéticos exclusivos de QA.

**Vídeo demonstrativo: pendente de gravação e publicação pelo integrante responsável.**
