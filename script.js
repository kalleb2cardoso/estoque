const formProduto = document.querySelector("#formProduto");
const listaProdutos = document.querySelector("#listaProdutos");
const pesquisa = document.querySelector("#pesquisa");

const listaHistorico = document.querySelector("#listaHistorico");
const limparHistorico = document.querySelector("#limparHistorico");

let produtos =
    JSON.parse(localStorage.getItem("produtos")) || [];

let historico =
    JSON.parse(localStorage.getItem("historico")) || [];

let produtoEditando = null;

let filtroAtual = "";


// ========================
// SALVAR
// ========================

function salvarProdutos() {

    try {

        localStorage.setItem(
            "produtos",
            JSON.stringify(produtos)
        );

    } catch (erro) {

        alert(
            "Não foi possível salvar os produtos. O armazenamento do navegador pode estar cheio ou desabilitado."
        );
    }
}

function salvarHistorico() {

    try {

        localStorage.setItem(
            "historico",
            JSON.stringify(historico)
        );

    } catch (erro) {

        alert(
            "Não foi possível salvar o histórico. O armazenamento do navegador pode estar cheio ou desabilitado."
        );
    }
}


// ========================
// FILTRO ATUAL
// ========================

function produtosFiltrados() {

    if (filtroAtual === "") {
        return produtos;
    }

    return produtos.filter(
        produto =>

            produto.nome
                .toLowerCase()
                .includes(filtroAtual)

            ||

            produto.categoria
                .toLowerCase()
                .includes(filtroAtual)
    );
}


// ========================
// PRODUTOS
// ========================

function mostrarProdutos(lista = produtos) {

    listaProdutos.innerHTML = "";

    lista.forEach((produto) => {

        const linha = document.createElement("tr");

        const celulaNome = document.createElement("td");
        celulaNome.textContent = produto.nome;

        const celulaCategoria = document.createElement("td");
        celulaCategoria.textContent = produto.categoria;

        const celulaQuantidade = document.createElement("td");
        celulaQuantidade.textContent = produto.quantidade;

        if (produto.quantidade <= 5) {
            celulaQuantidade.classList.add("baixo");
        }

        const celulaPreco = document.createElement("td");
        celulaPreco.textContent = produto.preco.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

        const celulaTotal = document.createElement("td");
        celulaTotal.textContent = (produto.quantidade * produto.preco)
            .toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );

        const celulaAcoes = document.createElement("td");

        const btnEntrada = document.createElement("button");
        btnEntrada.className = "btn-entrada";
        btnEntrada.textContent = "+ Entrada";
        btnEntrada.addEventListener("click", () => entradaEstoque(produto.id));

        const btnSaida = document.createElement("button");
        btnSaida.className = "btn-saida";
        btnSaida.textContent = "- Saída";
        btnSaida.addEventListener("click", () => saidaEstoque(produto.id));

        const btnEditar = document.createElement("button");
        btnEditar.className = "btn-editar";
        btnEditar.textContent = "Editar";
        btnEditar.addEventListener("click", () => editarProduto(produto.id));

        const btnExcluir = document.createElement("button");
        btnExcluir.className = "btn-excluir";
        btnExcluir.textContent = "Excluir";
        btnExcluir.addEventListener("click", () => excluirProduto(produto.id));

        celulaAcoes.append(btnEntrada, btnSaida, btnEditar, btnExcluir);

        linha.append(
            celulaNome,
            celulaCategoria,
            celulaQuantidade,
            celulaPreco,
            celulaTotal,
            celulaAcoes
        );

        listaProdutos.appendChild(linha);
    });

    atualizarDashboard();
}


// ========================
// DASHBOARD
// ========================

function atualizarDashboard() {

    const totalProdutos =
        produtos.length;

    const totalUnidades =
        produtos.reduce(
            (total, produto) =>
                total + produto.quantidade,
            0
        );

    const estoqueBaixo =
        produtos.filter(
            produto =>
                produto.quantidade <= 5
        ).length;

    const valorEstoque =
        produtos.reduce(
            (total, produto) =>
                total +
                produto.quantidade *
                produto.preco,
            0
        );

    document.querySelector(
        "#totalProdutos"
    ).textContent = totalProdutos;

    document.querySelector(
        "#totalUnidades"
    ).textContent = totalUnidades;

    document.querySelector(
        "#estoqueBaixo"
    ).textContent = estoqueBaixo;

    document.querySelector(
        "#valorEstoque"
    ).textContent =
        valorEstoque.toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
}


// ========================
// CADASTRAR / EDITAR
// ========================

formProduto.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const nome =
            document.querySelector(
                "#nome"
            ).value.trim();

        const categoria =
            document.querySelector(
                "#categoria"
            ).value.trim();

        const quantidade =
            Number(
                document.querySelector(
                    "#quantidade"
                ).value
            );

        const preco =
            Number(
                document.querySelector(
                    "#preco"
                ).value
            );

        if (
            nome === "" ||
            categoria === "" ||
            quantidade < 0 ||
            preco < 0
        ) {

            alert(
                "Preencha os dados corretamente."
            );

            return;
        }


        // EDITANDO

        if (produtoEditando !== null) {

            const produto =
                produtos.find(
                    produto =>
                        produto.id ===
                        produtoEditando
                );

            produto.nome = nome;
            produto.categoria = categoria;
            produto.quantidade = quantidade;
            produto.preco = preco;

            produtoEditando = null;

            document.querySelector(
                "form button[type='submit']"
            ).textContent =
                "Cadastrar Produto";

        } else {

            // CADASTRANDO

            const produto = {

                id: crypto.randomUUID(),

                nome: nome,

                categoria: categoria,

                quantidade: quantidade,

                preco: preco
            };

            produtos.push(produto);
        }

        salvarProdutos();

        mostrarProdutos(produtosFiltrados());

        formProduto.reset();
    }
);


// ========================
// EDITAR PRODUTO
// ========================

function editarProduto(id) {

    const produto =
        produtos.find(
            produto =>
                produto.id === id
        );

    if (!produto) {
        return;
    }

    document.querySelector(
        "#nome"
    ).value = produto.nome;

    document.querySelector(
        "#categoria"
    ).value = produto.categoria;

    document.querySelector(
        "#quantidade"
    ).value = produto.quantidade;

    document.querySelector(
        "#preco"
    ).value = produto.preco;

    produtoEditando = id;

    document.querySelector(
        "form button[type='submit']"
    ).textContent =
        "Salvar Alterações";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ========================
// ENTRADA
// ========================

function entradaEstoque(id) {

    const produto =
        produtos.find(
            produto =>
                produto.id === id
        );

    if (!produto) {
        return;
    }

    const quantidade =
        Number(
            prompt(
                "Quantidade que entrou:"
            )
        );

    if (
        !quantidade ||
        quantidade <= 0
    ) {

        alert(
            "Digite uma quantidade válida."
        );

        return;
    }

    produto.quantidade += quantidade;

    registrarMovimentacao(
        produto.nome,
        "Entrada",
        quantidade
    );

    salvarProdutos();

    mostrarProdutos(produtosFiltrados());
}


// ========================
// SAÍDA
// ========================

function saidaEstoque(id) {

    const produto =
        produtos.find(
            produto =>
                produto.id === id
        );

    if (!produto) {
        return;
    }

    const quantidade =
        Number(
            prompt(
                "Quantidade que saiu:"
            )
        );

    if (
        !quantidade ||
        quantidade <= 0
    ) {

        alert(
            "Digite uma quantidade válida."
        );

        return;
    }

    if (
        quantidade >
        produto.quantidade
    ) {

        alert(
            "Quantidade maior que o estoque disponível!"
        );

        return;
    }

    produto.quantidade -= quantidade;

    registrarMovimentacao(
        produto.nome,
        "Saída",
        quantidade
    );

    salvarProdutos();

    mostrarProdutos(produtosFiltrados());
}


// ========================
// EXCLUIR
// ========================

function excluirProduto(id) {

    const confirmar =
        confirm(
            "Deseja realmente excluir este produto?"
        );

    if (!confirmar) {
        return;
    }

    produtos =
        produtos.filter(
            produto =>
                produto.id !== id
        );

    salvarProdutos();

    mostrarProdutos(produtosFiltrados());
}


// ========================
// HISTÓRICO
// ========================

function registrarMovimentacao(
    produto,
    tipo,
    quantidade
) {

    const movimentacao = {

        id: crypto.randomUUID(),

        produto: produto,

        tipo: tipo,

        quantidade: quantidade,

        data: new Date()
            .toLocaleString("pt-BR")
    };

    historico.unshift(
        movimentacao
    );

    salvarHistorico();

    mostrarHistorico();
}


function mostrarHistorico() {

    listaHistorico.innerHTML = "";

    historico.forEach(
        (movimentacao) => {

            const linha =
                document.createElement(
                    "tr"
                );

            const celulaData = document.createElement("td");
            celulaData.textContent = movimentacao.data;

            const celulaProduto = document.createElement("td");
            celulaProduto.textContent = movimentacao.produto;

            const celulaTipo = document.createElement("td");
            celulaTipo.textContent = movimentacao.tipo;
            celulaTipo.classList.add(
                movimentacao.tipo === "Entrada"
                    ? "tipo-entrada"
                    : "tipo-saida"
            );

            const celulaQuantidade = document.createElement("td");
            celulaQuantidade.textContent = movimentacao.quantidade;

            linha.append(
                celulaData,
                celulaProduto,
                celulaTipo,
                celulaQuantidade
            );

            listaHistorico.appendChild(
                linha
            );
        }
    );
}


// ========================
// LIMPAR HISTÓRICO
// ========================

limparHistorico.addEventListener(
    "click",
    function() {

        const confirmar =
            confirm(
                "Deseja apagar todo o histórico?"
            );

        if (!confirmar) {
            return;
        }

        historico = [];

        salvarHistorico();

        mostrarHistorico();
    }
);


// ========================
// PESQUISA
// ========================

pesquisa.addEventListener(
    "input",
    function() {

        filtroAtual =
            pesquisa.value
                .toLowerCase()
                .trim();

        mostrarProdutos(
            produtosFiltrados()
        );
    }
);


// ========================
// INICIAR SISTEMA
// ========================

mostrarProdutos();

mostrarHistorico();