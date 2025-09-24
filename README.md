Guia de Uso da Aplicação CCD (Comunidade de Cristo em Chamas Divinas)
Este documento descreve como iniciar e usar a aplicação de devocionais e gamificação. O projeto é dividido em duas partes principais: um frontend (interface do usuário, feita em React) e um backend (servidor e API, feito em Node.js com Express).

🚀 Como Iniciar a Aplicação
Para que a aplicação funcione corretamente, você deve ter dois terminais abertos, um para o backend e outro para o frontend.

1. Iniciar o Backend
Abra o terminal e navegue até a pasta backend.

Execute o comando npm start.

Você verá mensagens confirmando que o servidor está rodando na porta 3001 e que as rotas foram carregadas.

2. Iniciar o Frontend
Abra um segundo terminal e navegue até a pasta frontend.

Execute o comando npm start.

O navegador abrirá automaticamente em http://localhost:3000, e sua aplicação estará pronta para uso.

🔑 Níveis de Permissão
A aplicação tem um sistema de permissão que afeta as funcionalidades visíveis para cada usuário:

Membro: Usuário comum. Pode criar e ver devocionais, pedidos de oração, eventos e o ranking de XP. Pode deletar apenas seus próprios devocionais.

Pastor(a) e Desenvolvedor: Nível de administrador. Além das permissões de Membro, podem aprovar ou rejeitar devocionais pendentes e excluir qualquer devocional, pedido de oração ou evento.

✨ Funcionalidades Principais
1. Devocionais
Envio de Conteúdo: Usuários logados podem enviar devocionais. O formulário aceita texto com formatação Markdown (**negrito**) e permite o upload de arquivos (imagens, vídeos e áudios).

Aprovação: Pastores e Desenvolvedores têm um painel na página "Minha Conta" para aprovar ou rejeitar devocionais pendentes.

Visualização: O feed público mostra todos os devocionais aprovados.

Exclusão: Pastores e Desenvolvedores podem deletar qualquer devocional. Um autor pode deletar apenas seu próprio devocional.

2. Gamificação e Ranking
XP: Cada devocional aprovado concede 50 pontos de XP ao autor.

Ranking: Na barra de navegação superior, o link "Ranking" exibe a classificação dos usuários com base na pontuação de XP, incentivando o engajamento.

3. Mural de Oração
Envio: Membros logados podem enviar pedidos de oração.

Visualização: O mural exibe todos os pedidos, e a identidade do autor pode ser oculta, se solicitado.

Exclusão (Moderação): Pastores e Desenvolvedores podem excluir pedidos de oração do mural.

4. Eventos e Avisos
Visualização: A página de Eventos mostra todos os eventos futuros.

Criação: Apenas Pastores e Desenvolvedores têm acesso ao formulário de criação de eventos na página de Eventos.

Exclusão: Apenas Pastores e Desenvolvedores podem excluir eventos.
