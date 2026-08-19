const formProduto =
    document.querySelector("#formProduto");

const listaProdutos =
    document.querySelector("#listaProdutos");

const pesquisa =
    document.querySelector("#pesquisa");

const listaHistorico =
    document.querySelector("#listaHistorico");

const limparHistorico =
    document.querySelector("#limparHistorico");


let produtos = [];

let produtoEditando = null;

let filtroAtual = "";


// ======================================
// CARREGAR PRODUTOS
// ======================================

async function carregarProdutos() {

    try {

        const resposta =
            await fetch("/produtos");

        if (!resposta.ok) {
            throw new Error(
                "Erro ao buscar produtos"
            );
        }

        produtos =
            await resposta.json();

        mostrarProdutos(
            produtosFiltrados()
        );

        atualizarDashboard();

    } catch (erro) {

        console.error(
            "Erro ao carregar produtos:",
            erro
        );

    }
}


// ======================================
// FILTRAR PRODUTOS
// ======================================

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


// ======================================
// MOSTRAR PRODUTOS
// ======================================

function mostrarProdutos(lista) {

    listaProdutos.innerHTML = "";

    lista.forEach(produto => {

        const linha =
            document.createElement("tr");


        const celulaNome =
            document.createElement("td");

        celulaNome.textContent =
            produto.nome;


        const celulaCategoria =
            document.createElement("td");

        celulaCategoria.textContent =
            produto.categoria;


        const celulaQuantidade =
            document.createElement("td");

        celulaQuantidade.textContent =
            produto.quantidade;


        if (
            Number(produto.quantidade)
            <= Number(produto.estoque_minimo || 5)
        ) {

            celulaQuantidade
                .classList.add("baixo");
        }


        const celulaPreco =
            document.createElement("td");

        celulaPreco.textContent =
            Number(produto.preco)
                .toLocaleString(
                    "pt-BR",
                    {
                        style: "currency",
                        currency: "BRL"
                    }
                );


        const celulaTotal =
            document.createElement("td");

        const total =
            Number(produto.quantidade)
            *
            Number(produto.preco);

        celulaTotal.textContent =
            total.toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );


        const celulaAcoes =
            document.createElement("td");


        const btnEntrada =
            document.createElement("button");

        btnEntrada.className =
            "btn-entrada";

        btnEntrada.textContent =
            "+ Entrada";

        btnEntrada.addEventListener(
            "click",
            () =>
                entradaEstoque(produto.id)
        );


        const btnSaida =
            document.createElement("button");

        btnSaida.className =
            "btn-saida";

        btnSaida.textContent =
            "- Saída";

        btnSaida.addEventListener(
            "click",
            () =>
                saidaEstoque(produto.id)
        );


        const btnEditar =
            document.createElement("button");

        btnEditar.className =
            "btn-editar";

        btnEditar.textContent =
            "Editar";

        btnEditar.addEventListener(
            "click",
            () =>
                editarProduto(produto.id)
        );


        const btnExcluir =
            document.createElement("button");

        btnExcluir.className =
            "btn-excluir";

        btnExcluir.textContent =
            "Excluir";

        btnExcluir.addEventListener(
            "click",
            () =>
                excluirProduto(produto.id)
        );


        celulaAcoes.append(
            btnEntrada,
            btnSaida,
            btnEditar,
            btnExcluir
        );


        linha.append(
            celulaNome,
            celulaCategoria,
            celulaQuantidade,
            celulaPreco,
            celulaTotal,
            celulaAcoes
        );


        listaProdutos.appendChild(
            linha
        );

    });
}


// ======================================
// DASHBOARD
// ======================================

function atualizarDashboard() {

    const totalProdutos =
        produtos.length;


    const totalUnidades =
        produtos.reduce(
            (total, produto) =>
                total
                +
                Number(
                    produto.quantidade
                ),
            0
        );


    const estoqueBaixo =
        produtos.filter(
            produto =>
                Number(produto.quantidade)
                <=
                Number(
                    produto.estoque_minimo
                    || 5
                )
        ).length;


    const valorEstoque =
        produtos.reduce(
            (total, produto) =>
                total
                +
                Number(
                    produto.quantidade
                )
                *
                Number(
                    produto.preco
                ),
            0
        );


    document.querySelector(
        "#totalProdutos"
    ).textContent =
        totalProdutos;


    document.querySelector(
        "#totalUnidades"
    ).textContent =
        totalUnidades;


    document.querySelector(
        "#estoqueBaixo"
    ).textContent =
        estoqueBaixo;


    document.querySelector(
        "#valorEstoque"
    ).textContent =
        valorEstoque
            .toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );
}


// ======================================
// CADASTRAR / EDITAR
// ======================================

formProduto.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const nome =
            document.querySelector(
                "#nome"
            )
            .value
            .trim();


        const categoria =
            document.querySelector(
                "#categoria"
            )
            .value
            .trim();


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


        const dados = {
            nome,
            categoria,
            quantidade,
            preco
        };


        try {

            if (
                produtoEditando !== null
            ) {

                await fetch(
                    `/produtos/${produtoEditando}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                dados
                            )
                    }
                );


                produtoEditando = null;


                document.querySelector(
                    "form button[type='submit']"
                ).textContent =
                    "Cadastrar Produto";


            } else {

                await fetch(
                    "/produtos",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                dados
                            )
                    }
                );
            }


            formProduto.reset();

            await carregarProdutos();


        } catch (erro) {

            console.error(
                "Erro ao salvar produto:",
                erro
            );

        }
    }
);


// ======================================
// EDITAR
// ======================================

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
    ).value =
        produto.nome;


    document.querySelector(
        "#categoria"
    ).value =
        produto.categoria;


    document.querySelector(
        "#quantidade"
    ).value =
        produto.quantidade;


    document.querySelector(
        "#preco"
    ).value =
        produto.preco;


    produtoEditando =
        id;


    document.querySelector(
        "form button[type='submit']"
    ).textContent =
        "Salvar Alterações";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ======================================
// ENTRADA
// ======================================

async function entradaEstoque(id) {

    const quantidade =
        Number(
            prompt(
                "Quantidade que entrou:"
            )
        );


    if (
        !quantidade
        ||
        quantidade <= 0
    ) {

        alert(
            "Digite uma quantidade válida."
        );

        return;
    }


    const resposta =
        await fetch(
            `/produtos/${id}/entrada`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        quantidade
                    })
            }
        );


    const resultado =
        await resposta.json();


    if (!resposta.ok) {

        alert(
            resultado.erro
        );

        return;
    }


    await carregarProdutos();

    await carregarHistorico();
}


// ======================================
// SAÍDA
// ======================================

async function saidaEstoque(id) {

    const quantidade =
        Number(
            prompt(
                "Quantidade que saiu:"
            )
        );


    if (
        !quantidade
        ||
        quantidade <= 0
    ) {

        alert(
            "Digite uma quantidade válida."
        );

        return;
    }


    const resposta =
        await fetch(
            `/produtos/${id}/saida`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body:
                    JSON.stringify({
                        quantidade
                    })
            }
        );


    const resultado =
        await resposta.json();


    if (!resposta.ok) {

        alert(
            resultado.erro
        );

        return;
    }


    await carregarProdutos();

    await carregarHistorico();
}


// ======================================
// EXCLUIR
// ======================================

async function excluirProduto(id) {

    const confirmar =
        confirm(
            "Deseja realmente excluir este produto?"
        );


    if (!confirmar) {
        return;
    }


    const resposta =
        await fetch(
            `/produtos/${id}`,
            {
                method: "DELETE"
            }
        );


    const resultado =
        await resposta.json();


    if (!resposta.ok) {

        alert(
            resultado.erro
        );

        return;
    }


    await carregarProdutos();
}


// ======================================
// HISTÓRICO
// ======================================

async function carregarHistorico() {

    try {

        const resposta =
            await fetch(
                "/movimentacoes"
            );


        const historico =
            await resposta.json();


        listaHistorico.innerHTML =
            "";


        historico.forEach(
            movimentacao => {

                const linha =
                    document.createElement(
                        "tr"
                    );


                const data =
                    new Date(
                        movimentacao
                            .data_movimentacao
                    )
                    .toLocaleString(
                        "pt-BR"
                    );


                linha.innerHTML = `
                    <td>${data}</td>

                    <td>
                        ${movimentacao.produto}
                    </td>

                    <td class="${
                        movimentacao.tipo === "ENTRADA"
                        ? "tipo-entrada"
                        : "tipo-saida"
                    }">
                        ${movimentacao.tipo}
                    </td>

                    <td>
                        ${movimentacao.quantidade}
                    </td>
                `;


                listaHistorico
                    .appendChild(
                        linha
                    );

            }
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar histórico:",
            erro
        );

    }
}


// ======================================
// PESQUISA
// ======================================

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


// ======================================
// LIMPAR HISTÓRICO
// ======================================

limparHistorico.addEventListener(
    "click",
    function() {

        alert(
            "Por enquanto o histórico está salvo no MySQL e não será apagado por este botão."
        );

    }
);


// ======================================
// INICIAR
// ======================================

carregarProdutos();

carregarHistorico();