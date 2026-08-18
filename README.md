Sistema de Estoque
Aplicação web simples para controle de estoque: cadastro de produtos, entrada e saída de itens, histórico de movimentações e um dashboard com totais. Todos os dados ficam salvos no localStorage do navegador — não há backend nem build.

Funcionalidades
Cadastro, edição e exclusão de produtos
Registro de entrada e saída de estoque, com validação de quantidade e de estoque disponível
Histórico de movimentações (com opção de limpar tudo)
Pesquisa por nome ou categoria, mantida ao editar/entrar/sair itens
Dashboard com total de produtos, unidades, itens com estoque baixo (≤ 5 unidades) e valor total em estoque
Como rodar
Não há dependências nem build — basta abrir o index.html no navegador:

open index.html
Tecnologias
HTML5
CSS3 (grid/flexbox, responsivo)
JavaScript vanilla (sem frameworks), persistência via localStorage
Estrutura
.
├── index.html   # marcação e estrutura das seções (dashboard, cadastro, produtos, histórico)
├── script.js    # toda a lógica: CRUD de produtos, estoque, histórico, pesquisa e dashboard
├── style.css    # estilos e responsividade
├── LICENSE
└── README.md
Revisão de código e correções aplicadas
Antes de publicar, o projeto passou por uma revisão e os seguintes pontos foram corrigidos:

Problema	Onde	Correção
XSS armazenado — nome/categoria do produto iam direto para innerHTML sem escapar	mostrarProdutos, mostrarHistorico	Renderização trocada para textContent/createElement, sem interpretar HTML
IDs colidíveis (Date.now()) — dois cadastros no mesmo milissegundo geravam o mesmo ID	criação de produto e de movimentação	Trocado por crypto.randomUUID()
Handlers onclick inline dependendo de funções globais implícitas	botões de ação da tabela de produtos	Trocado por addEventListener
localStorage.setItem sem tratamento de erro (falha silenciosa em modo privado/quota cheia)	salvarProdutos, salvarHistorico	try/catch com aviso ao usuário
Filtro de pesquisa era perdido após editar, dar entrada/saída ou excluir um produto	formProduto (submit), entradaEstoque, saidaEstoque, excluirProduto	Filtro atual (filtroAtual) reaplicado após cada ação
Campo de pesquisa sem rótulo acessível (só placeholder)	index.html	Adicionado aria-label
Também foi encontrado e removido um repositório Git acidental na raiz da pasta pessoal do usuário (sem commits, sem remote) que teria colocado arquivos pessoais em stage caso um git add fosse executado ali. A pasta do projeto foi renomeada de sistema de estoque (com espaço no final) para sistema-de-estoque para evitar problemas de clone/URL.

Licença
Distribuído sob a licença MIT. Veja LICENSE.
