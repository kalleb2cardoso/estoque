Sistema web para controle de produtos e movimentações de estoque, desenvolvido com HTML5, CSS3 e JavaScript puro (Vanilla JS). Todos os dados são salvos no localStorage do navegador, sem necessidade de backend ou banco de dados.

✨ Funcionalidades
Dashboard

Painel com indicadores atualizados automaticamente:

Indicador	Descrição
Produtos	Total de produtos cadastrados
Unidades	Soma de todas as unidades em estoque
Estoque Baixo	Produtos com quantidade menor ou igual a 5
Valor do Estoque	Valor total (quantidade × preço), em R$
Gestão de produtos
Cadastro de produtos com nome, categoria, quantidade e preço
Edição de produtos já cadastrados (o formulário muda para o modo "Salvar Alterações")
Exclusão com confirmação
Destaque visual em vermelho para itens com estoque baixo (≤ 5 unidades)
Cálculo automático do valor total por produto
Movimentações
+ Entrada — adiciona unidades ao estoque
- Saída — remove unidades, com validação para impedir saída maior que o disponível
Histórico
Registro automático de todas as entradas e saídas com data, hora, produto, tipo e quantidade
Movimentações mais recentes aparecem no topo
Botão para limpar todo o histórico
Pesquisa
Busca em tempo real por nome ou categoria
O filtro permanece ativo durante cadastros, edições e movimentações
🛠️ Tecnologias
HTML5 — estrutura semântica (header, main, section, article)
CSS3 — CSS Grid, Flexbox e Media Queries (layout responsivo, sem frameworks)
JavaScript ES6+ — manipulação do DOM, localStorage, crypto.randomUUID(), toLocaleString para formatação de moeda em pt-BR

Nenhuma dependência externa. Nenhuma instalação necessária.

📁 Estrutura do projeto
sistema-de-estoque/
├── index.html      # Estrutura da página
├── style.css       # Estilos e responsividade
└── script.js       # Toda a lógica da aplicação
🚀 Como usar
Clone ou baixe o repositório:
bash
   git clone https://github.com/kalleb2cardoso/sistema-de-estoque.git
Abra o arquivo index.html no navegador.

Pronto — não é preciso servidor, build ou instalação de pacotes.

💾 Armazenamento dos dados

Os dados ficam salvos no localStorage do navegador em duas chaves:

produtos — lista de produtos cadastrados
historico — registro de movimentações

Atenção: por serem salvos localmente, os dados são específicos de cada navegador e computador. Limpar os dados de navegação apaga as informações do sistema.

📱 Responsividade

O layout se adapta a três faixas de tela:

Acima de 900px — dashboard e formulário em 4 colunas
Até 900px — dashboard e formulário em 2 colunas
Até 600px — layout em coluna única, com rolagem horizontal nas tabelas
🔮 Melhorias futuras
 Substituir prompt/alert/confirm por modais personalizados
 Exportar produtos e histórico para CSV ou PDF
 Filtrar o histórico por período ou tipo de movimentação
 Ordenar a tabela ao clicar no cabeçalho das colunas
 Modo escuro
 Categorias em select em vez de campo de texto livre
👤 Autor

Desenvolvido por Kalleb Cardoso — @kalleb2cardoso
