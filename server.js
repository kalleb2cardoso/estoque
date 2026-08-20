require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const app = express();


// ======================================
// CONFIGURAÇÕES DO EXPRESS
// ======================================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ======================================
// SESSÃO
// ======================================

app.use(session({
    secret: process.env.SESSION_SECRET || 'estoque-secreto-2026',
    resave: false,
    saveUninitialized: false
}));


// ======================================
// VERIFICAR LOGIN
// ======================================

function verificarLogin(req, res, next) {

    if (!req.session.usuario) {
        return res.redirect('/login.html');
    }

    next();
}


// ======================================
// CONEXÃO COM MYSQL
// ======================================

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
// PÁGINAS PÚBLICAS
// ======================================

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/cadastro.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'cadastro.html'));
});


// ======================================
// PÁGINA PRINCIPAL PROTEGIDA
// ======================================

app.get('/', verificarLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', verificarLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


// ======================================
// ARQUIVOS CSS E JAVASCRIPT
// ======================================

app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'style.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

app.get('/auth.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth.css'));
});


// ======================================
// CADASTRO DE USUÁRIO
// ======================================

app.post('/cadastro', async (req, res) => {

    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({
            erro: 'Preencha todos os campos'
        });
    }

    try {

        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const sql = `
            INSERT INTO usuarios
            (nome, email, senha)
            VALUES (?, ?, ?)
        `;

        connection.query(
            sql,
            [nome, email, senhaCriptografada],
            (erro) => {

                if (erro) {

                    console.error(erro);

                    if (erro.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({
                            erro: 'Este e-mail já está cadastrado'
                        });
                    }

                    return res.status(500).json({
                        erro: 'Erro ao cadastrar usuário'
                    });
                }

                res.status(201).json({
                    mensagem: 'Usuário cadastrado com sucesso!'
                });
            }
        );

    } catch (erro) {

        console.error(erro);

        res.status(500).json({
            erro: 'Erro interno'
        });
    }
});


// ======================================
// LOGIN DO USUÁRIO
// ======================================

app.post('/login', (req, res) => {

    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            erro: 'Informe e-mail e senha'
        });
    }

    const sql = `
        SELECT *
        FROM usuarios
        WHERE email = ?
    `;

    connection.query(
        sql,
        [email],
        async (erro, resultados) => {

            if (erro) {

                console.error(erro);

                return res.status(500).json({
                    erro: 'Erro no servidor'
                });
            }

            if (resultados.length === 0) {

                return res.status(401).json({
                    erro: 'E-mail ou senha inválidos'
                });
            }

            const usuario = resultados[0];

            try {

                const senhaCorreta = await bcrypt.compare(
                    senha,
                    usuario.senha
                );

                if (!senhaCorreta) {

                    return res.status(401).json({
                        erro: 'E-mail ou senha inválidos'
                    });
                }

                req.session.usuario = {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email
                };

                res.json({
                    mensagem: 'Login realizado com sucesso!',
                    usuario: {
                        id: usuario.id,
                        nome: usuario.nome,
                        email: usuario.email
                    }
                });

            } catch (erro) {

                console.error(erro);

                res.status(500).json({
                    erro: 'Erro ao verificar senha'
                });
            }
        }
    );
});


// ======================================
// VERIFICAR USUÁRIO LOGADO
// ======================================

app.get('/usuario-logado', (req, res) => {

    if (!req.session.usuario) {
        return res.status(401).json({
            logado: false
        });
    }

    res.json({
        logado: true,
        usuario: req.session.usuario
    });
});


// ======================================
// LOGOUT
// ======================================

app.post('/logout', (req, res) => {

    req.session.destroy((erro) => {

        if (erro) {

            console.error(erro);

            return res.status(500).json({
                erro: 'Erro ao sair'
            });
        }

        res.clearCookie('connect.sid');

        res.json({
            mensagem: 'Logout realizado com sucesso'
        });
    });
});


// ======================================
// BUSCAR PRODUTOS
// ======================================

app.get('/produtos', verificarLogin, (req, res) => {

    const sql = `
        SELECT *
        FROM produtos
        WHERE ativo = 1
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
// CADASTRAR PRODUTO + AUDITORIA
// ======================================

app.post('/produtos', verificarLogin, (req, res) => {

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

            const usuario = req.session.usuario;

            const sqlAuditoria = `
                INSERT INTO auditoria
                (
                    usuario_id,
                    usuario_nome,
                    acao,
                    produto_id,
                    descricao
                )
                VALUES (?, ?, ?, ?, ?)
            `;

            connection.query(
                sqlAuditoria,
                [
                    usuario.id,
                    usuario.nome,
                    'CADASTRO',
                    resultado.insertId,
                    `Cadastrou o produto ${nome}`
                ],
                (erroAuditoria) => {

                    if (erroAuditoria) {
                        console.error(
                            'Erro ao registrar auditoria:',
                            erroAuditoria
                        );
                    }
                }
            );

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

app.put('/produtos/:id', verificarLogin, (req, res) => {

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

            if (resultado.affectedRows === 0) {
                return res.status(404).json({
                    erro: 'Produto não encontrado'
                });
            }

            const usuario = req.session.usuario;

            const sqlAuditoria = `
                INSERT INTO auditoria
                (
                    usuario_id,
                    usuario_nome,
                    acao,
                    produto_id,
                    descricao
                )
                VALUES (?, ?, ?, ?, ?)
            `;

            connection.query(
                sqlAuditoria,
                [
                    usuario.id,
                    usuario.nome,
                    'EDICAO',
                    id,
                    `Editou o produto ${nome}`
                ],
                (erroAuditoria) => {

                    if (erroAuditoria) {
                        console.error(
                            'Erro ao registrar auditoria:',
                            erroAuditoria
                        );
                    }
                }
            );

            res.json({
                mensagem: 'Produto atualizado'
            });
        }
    );
});


// ======================================
// EXCLUIR PRODUTO
// ======================================

app.delete('/produtos/:id', verificarLogin, (req, res) => {

    const id = req.params.id;

    connection.query(
        'SELECT nome FROM produtos WHERE id = ? AND ativo = 1',
        [id],
        (erroBusca, produtos) => {

            if (erroBusca) {

                console.error(erroBusca);

                return res.status(500).json({
                    erro: 'Erro ao excluir produto'
                });
            }

            if (produtos.length === 0) {
                return res.status(404).json({
                    erro: 'Produto não encontrado'
                });
            }

            const nome = produtos[0].nome;

            const sql = `
                UPDATE produtos
                SET ativo = 0
                WHERE id = ?
            `;

            connection.query(
                sql,
                [id],
                (erro, resultado) => {

                    if (erro) {

                        console.error(erro);

                        return res.status(500).json({
                            erro: 'Erro ao excluir produto'
                        });
                    }

                    if (resultado.affectedRows === 0) {
                        return res.status(404).json({
                            erro: 'Produto não encontrado'
                        });
                    }

                    const usuario = req.session.usuario;

                    const sqlAuditoria = `
                        INSERT INTO auditoria
                        (
                            usuario_id,
                            usuario_nome,
                            acao,
                            produto_id,
                            descricao
                        )
                        VALUES (?, ?, ?, ?, ?)
                    `;

                    connection.query(
                        sqlAuditoria,
                        [
                            usuario.id,
                            usuario.nome,
                            'EXCLUSAO',
                            id,
                            `Excluiu o produto ${nome}`
                        ],
                        (erroAuditoria) => {

                            if (erroAuditoria) {
                                console.error(
                                    'Erro ao registrar auditoria:',
                                    erroAuditoria
                                );
                            }
                        }
                    );

                    res.json({
                        mensagem: 'Produto excluído'
                    });
                }
            );
        }
    );
});


// ======================================
// ENTRADA DE ESTOQUE
// ======================================

app.post('/produtos/:id/entrada', verificarLogin, (req, res) => {

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

            if (erro) {

                console.error(erro);

                return res.status(500).json({
                    erro: 'Erro ao buscar produto'
                });
            }

            if (produtos.length === 0) {

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

                        console.error(erro);

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
                        ],
                        (erro) => {

                            if (erro) {
                                console.error(
                                    'Erro ao registrar movimentação:',
                                    erro
                                );
                            }
                        }
                    );

                    const usuario = req.session.usuario;

                    const sqlAuditoria = `
                        INSERT INTO auditoria
                        (
                            usuario_id,
                            usuario_nome,
                            acao,
                            produto_id,
                            descricao
                        )
                        VALUES (?, ?, ?, ?, ?)
                    `;

                    connection.query(
                        sqlAuditoria,
                        [
                            usuario.id,
                            usuario.nome,
                            'ENTRADA',
                            id,
                            `Entrada de ${quantidade} unidade(s) no produto ${produto.nome}`
                        ],
                        (erroAuditoria) => {

                            if (erroAuditoria) {
                                console.error(
                                    'Erro ao registrar auditoria:',
                                    erroAuditoria
                                );
                            }
                        }
                    );

                    res.json({
                        mensagem:
                            `Entrada registrada para ${produto.nome}`
                    });
                }
            );
        }
    );
});


// ======================================
// SAÍDA DE ESTOQUE
// ======================================

app.post('/produtos/:id/saida', verificarLogin, (req, res) => {

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

            if (erro) {

                console.error(erro);

                return res.status(500).json({
                    erro: 'Erro ao buscar produto'
                });
            }

            if (produtos.length === 0) {

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

                        console.error(erro);

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
                        ],
                        (erro) => {

                            if (erro) {
                                console.error(
                                    'Erro ao registrar movimentação:',
                                    erro
                                );
                            }
                        }
                    );

                    const usuario = req.session.usuario;

                    const sqlAuditoria = `
                        INSERT INTO auditoria
                        (
                            usuario_id,
                            usuario_nome,
                            acao,
                            produto_id,
                            descricao
                        )
                        VALUES (?, ?, ?, ?, ?)
                    `;

                    connection.query(
                        sqlAuditoria,
                        [
                            usuario.id,
                            usuario.nome,
                            'SAIDA',
                            id,
                            `Saída de ${quantidade} unidade(s) no produto ${produto.nome}`
                        ],
                        (erroAuditoria) => {

                            if (erroAuditoria) {
                                console.error(
                                    'Erro ao registrar auditoria:',
                                    erroAuditoria
                                );
                            }
                        }
                    );

                    res.json({
                        mensagem:
                            `Saída registrada para ${produto.nome}`
                    });
                }
            );
        }
    );
});


// ======================================
// HISTÓRICO
// ======================================

app.get('/movimentacoes', verificarLogin, (req, res) => {

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
// CONSULTAR AUDITORIA
// ======================================

app.get('/auditoria', verificarLogin, (req, res) => {

    const sql = `
        SELECT *
        FROM auditoria
        ORDER BY data_acao DESC
    `;

    connection.query(sql, (erro, resultados) => {

        if (erro) {

            console.error(erro);

            return res.status(500).json({
                erro: 'Erro ao buscar auditoria'
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