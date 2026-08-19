require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');

const app = express();

app.use(express.json());
app.use(express.static(__dirname));

const connection = mysql.createConnection({
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    port: process.env.MYSQLPORT || process.env.DB_PORT,
    user: process.env.MYSQLUSER || process.env.DB_USER,
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQLDATABASE || process.env.DB_NAME
});

connection.connect((erro) => {
    if (erro) {
        console.error('Erro ao conectar ao MySQL:', erro);
        return;
    }

    console.log('Conectado ao MySQL!');
});


// ======================================
// BUSCAR PRODUTOS
// ======================================

app.get('/produtos', (req, res) => {

    const sql = `
        SELECT *
        FROM produtos
        ORDER BY nome
    `;

    connection.query(sql, (erro, resultados) => {

        if (erro) {
            console.error(erro);

            return res.status(500).json({
                erro: 'Erro ao buscar produtos'
            });
        }

        res.json(resultados);
    });
});


// ======================================
// CADASTRAR PRODUTO
// ======================================

app.post('/produtos', (req, res) => {

    const {
        nome,
        categoria,
        quantidade,
        preco
    } = req.body;

    if (
        !nome ||
        !categoria ||
        quantidade === undefined ||
        preco === undefined
    ) {
        return res.status(400).json({
            erro: 'Preencha todos os campos'
        });
    }

    const sql = `
        INSERT INTO produtos
        (nome, categoria, quantidade, preco)
        VALUES (?, ?, ?, ?)
    `;

    connection.query(
        sql,
        [nome, categoria, quantidade, preco],
        (erro, resultado) => {

            if (erro) {
                console.error(erro);

                return res.status(500).json({
                    erro: 'Erro ao cadastrar produto'
                });
            }

            res.status(201).json({
                mensagem: 'Produto cadastrado',
                id: resultado.insertId
            });
        }
    );
});


// ======================================
// EDITAR PRODUTO
// ======================================

app.put('/produtos/:id', (req, res) => {

    const id = req.params.id;

    const {
        nome,
        categoria,
        quantidade,
        preco
    } = req.body;

    const sql = `
        UPDATE produtos
        SET nome = ?,
            categoria = ?,
            quantidade = ?,
            preco = ?
        WHERE id = ?
    `;

    connection.query(
        sql,
        [nome, categoria, quantidade, preco, id],
        (erro, resultado) => {

            if (erro) {
                console.error(erro);

                return res.status(500).json({
                    erro: 'Erro ao editar produto'
                });
            }

            res.json({
                mensagem: 'Produto atualizado'
            });
        }
    );
});


// ======================================
// EXCLUIR PRODUTO
// ======================================

app.delete('/produtos/:id', (req, res) => {

    const id = req.params.id;

    const sql = `
        DELETE FROM produtos
        WHERE id = ?
    `;

    connection.query(
        sql,
        [id],
        (erro) => {

            if (erro) {
                console.error(erro);

                return res.status(500).json({
                    erro: 'Erro ao excluir produto'
                });
            }

            res.json({
                mensagem: 'Produto excluído'
            });
        }
    );
});


// ======================================
// ENTRADA DE ESTOQUE
// ======================================

app.post('/produtos/:id/entrada', (req, res) => {

    const id = req.params.id;
    const quantidade = Number(req.body.quantidade);

    if (!quantidade || quantidade <= 0) {
        return res.status(400).json({
            erro: 'Quantidade inválida'
        });
    }

    const sqlProduto = `
        SELECT *
        FROM produtos
        WHERE id = ?
    `;

    connection.query(
        sqlProduto,
        [id],
        (erro, produtos) => {

            if (erro || produtos.length === 0) {
                return res.status(404).json({
                    erro: 'Produto não encontrado'
                });
            }

            const produto = produtos[0];

            const sqlAtualizar = `
                UPDATE produtos
                SET quantidade = quantidade + ?
                WHERE id = ?
            `;

            connection.query(
                sqlAtualizar,
                [quantidade, id],
                (erro) => {

                    if (erro) {
                        return res.status(500).json({
                            erro: 'Erro ao atualizar estoque'
                        });
                    }

                    const sqlMovimentacao = `
                        INSERT INTO movimentacoes
                        (produto_id, tipo, quantidade, observacao)
                        VALUES (?, 'ENTRADA', ?, ?)
                    `;

                    connection.query(
                        sqlMovimentacao,
                        [
                            id,
                            quantidade,
                            `Entrada de ${quantidade} unidade(s)`
                        ]
                    );

                    res.json({
                        mensagem: `Entrada registrada para ${produto.nome}`
                    });
                }
            );
        }
    );
});


// ======================================
// SAÍDA DE ESTOQUE
// ======================================

app.post('/produtos/:id/saida', (req, res) => {

    const id = req.params.id;
    const quantidade = Number(req.body.quantidade);

    if (!quantidade || quantidade <= 0) {
        return res.status(400).json({
            erro: 'Quantidade inválida'
        });
    }

    const sqlProduto = `
        SELECT *
        FROM produtos
        WHERE id = ?
    `;

    connection.query(
        sqlProduto,
        [id],
        (erro, produtos) => {

            if (erro || produtos.length === 0) {
                return res.status(404).json({
                    erro: 'Produto não encontrado'
                });
            }

            const produto = produtos[0];

            if (quantidade > produto.quantidade) {
                return res.status(400).json({
                    erro: 'Quantidade maior que o estoque disponível'
                });
            }

            const sqlAtualizar = `
                UPDATE produtos
                SET quantidade = quantidade - ?
                WHERE id = ?
            `;

            connection.query(
                sqlAtualizar,
                [quantidade, id],
                (erro) => {

                    if (erro) {
                        return res.status(500).json({
                            erro: 'Erro ao atualizar estoque'
                        });
                    }

                    const sqlMovimentacao = `
                        INSERT INTO movimentacoes
                        (produto_id, tipo, quantidade, observacao)
                        VALUES (?, 'SAIDA', ?, ?)
                    `;

                    connection.query(
                        sqlMovimentacao,
                        [
                            id,
                            quantidade,
                            `Saída de ${quantidade} unidade(s)`
                        ]
                    );

                    res.json({
                        mensagem: `Saída registrada para ${produto.nome}`
                    });
                }
            );
        }
    );
});


// ======================================
// HISTÓRICO
// ======================================

app.get('/movimentacoes', (req, res) => {

    const sql = `
        SELECT
            movimentacoes.id,
            movimentacoes.data_movimentacao,
            movimentacoes.tipo,
            movimentacoes.quantidade,
            produtos.nome AS produto
        FROM movimentacoes

        INNER JOIN produtos
            ON produtos.id = movimentacoes.produto_id

        ORDER BY movimentacoes.data_movimentacao DESC
    `;

    connection.query(sql, (erro, resultados) => {

        if (erro) {
            console.error(erro);

            return res.status(500).json({
                erro: 'Erro ao buscar movimentações'
            });
        }

        res.json(resultados);
    });
});


// ======================================
// INICIAR SERVIDOR
// ======================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

