# Plano manual — Sprint 4

25 casos de sistema. Cada arquivo contém objetivo, pré-condições, entradas, saídas, passos e critério de aprovação. A execução manual permanece planejada; resultados automatizados são reportados separadamente.

D é a data UTC capturada no início: não trocar a data do sistema durante a execução. Os IDs de fixtures são guardados das respostas, enquanto nomes e valores são predefinidos.

- [CT01 — ADMIN autentica e abre o dashboard](CT01.md)
- [CT02 — Senha incorreta não cria sessão](CT02.md)
- [CT03 — TUTOR lista somente Rex e suas pendências](CT03.md)
- [CT04 — TUTOR recebe acesso negado em operação ADMIN](CT04.md)
- [CT05 — Dashboard apresenta 2 pets e 3 vacinas pendentes](CT05.md)
- [CT06 — Ficha do Rex exibe score 85 e ATENÇÃO](CT06.md)
- [CT07 — ADMIN cadastra pet pela interface e dados persistem](CT07.md)
- [CT08 — Formulário vazio mostra seis erros e não grava](CT08.md)
- [CT09 — JWT identifica o tutor e bloqueia token ausente ou inválido](CT09.md)
- [CT10 — Cadastro público fixa ROLE_TUTOR e rejeita e-mail repetido](CT10.md)
- [CT11 — TUTOR não acessa Mel nem transfere pet por tutorId](CT11.md)
- [CT12 — Pet percorre criação, filtro, edição e exclusão](CT12.md)
- [CT13 — Histórico e preço da consulta respeitam o perfil TUTOR](CT13.md)
- [CT14 — Score sem histórico é 40 e nunca fica abaixo de zero](CT14.md)
- [CT15 — Baixa pela interface cria reforço e atualiza score](CT15.md)
- [CT16 — Reaplicação retorna 409 sem criar nova dose](CT16.md)
- [CT17 — Reforço previamente agendado não é duplicado](CT17.md)
- [CT18 — Data futura retorna 400 sem aplicar nem criar reforço](CT18.md)
- [CT19 — Erros 404 e data inválida mantêm contrato claro](CT19.md)
- [CT20 — .NET autentica escrita e mantém histórico do pet](CT20.md)
- [CT21 — .NET protege leitura sensível sem token (aceite Sprint 4)](CT21.md)
- [CT22 — .NET separa liveness e readiness na indisponibilidade do Oracle](CT22.md)
- [CT23 — Mobile autentica, restaura sessão e protege logout](CT23.md)
- [CT24 — Mobile mantém pets e isola dados entre duas contas](CT24.md)
- [CT25 — Mobile mantém vacinas, calcula alerta e valida propriedade do pet](CT25.md)
