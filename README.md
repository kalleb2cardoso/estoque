# 📦 Sistema de Estoque

Sistema web para gerenciamento de estoque desenvolvido com o objetivo de praticar desenvolvimento Full Stack, integração com banco de dados e publicação de uma aplicação na web.

🌐 **Sistema online:**  
https://reliable-encouragement-production-bd03.up.railway.app

---

## 📖 Sobre o projeto

O **Sistema de Estoque** permite cadastrar e visualizar produtos através de uma interface web.

Os produtos são armazenados em um banco de dados **MySQL**, enquanto o backend desenvolvido com **Node.js e Express** é responsável pela comunicação entre o site e o banco de dados.

O projeto começou funcionando localmente e posteriormente foi publicado no **Railway**, permitindo acessar o sistema através de computadores e dispositivos móveis.

---

## 🚀 Funcionalidades

- 📦 Cadastro de produtos
- 📋 Listagem de produtos cadastrados
- 🔎 Pesquisa de produtos
- 📊 Dashboard do estoque
- 🔢 Controle de quantidade
- 💰 Controle de preços
- 💵 Cálculo do valor do estoque
- ⚠️ Indicador de estoque baixo
- 🗂️ Organização por categorias
- 📅 Estrutura para controle de validade
- 🏷️ Estrutura para controle de lote
- 🔢 Estrutura para código de barras
- 📈 Estrutura para movimentações de entrada e saída
- 🗄️ Armazenamento dos dados em MySQL
- 🌐 Aplicação publicada na internet

---

## 🛠️ Tecnologias utilizadas

### Front-end

- HTML5
- CSS3
- JavaScript

### Back-end

- Node.js
- Express.js

### Banco de dados

- MySQL
- mysql2

### Outras ferramentas

- Git
- GitHub
- Railway
- Visual Studio Code
- dotenv

---

## 🏗️ Estrutura do projeto

```text
estoque/
│
├── index.html
├── style.css
├── script.js
├── server.js
├── package.json
├── package-lock.json
├── .gitignore
├── .env
└── README.md
```

> O arquivo `.env` é utilizado apenas localmente e não é enviado para o GitHub.

---

## 🗄️ Banco de dados

O projeto utiliza **MySQL** para armazenar os dados.

A tabela principal é `produtos`.

### Estrutura de produtos

```sql
CREATE TABLE produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    quantidade INT NOT NULL DEFAULT 0,
    preco DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(100),
    validade DATE,
    lote VARCHAR(50),
    estoque_minimo INT DEFAULT 5,
    codigo_barras VARCHAR(50)
);
```

Também foi criada uma estrutura para registrar movimentações do estoque:

```sql
CREATE TABLE movimentacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    produto_id INT NOT NULL,
    tipo ENUM('ENTRADA', 'SAIDA') NOT NULL,
    quantidade INT NOT NULL,
    data_movimentacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    observacao VARCHAR(255),
    FOREIGN KEY (produto_id) REFERENCES produtos(id)
);
```

---

## 🔄 Como o sistema funciona

```text
Usuário
   ↓
Interface HTML/CSS/JavaScript
   ↓
API Node.js + Express
   ↓
MySQL
   ↓
Dados armazenados
```

Quando o usuário acessa o sistema pelo navegador, o JavaScript se comunica com a API desenvolvida em Node.js.

O servidor executa as operações necessárias no banco MySQL e devolve os resultados para a interface.

---

## 🌐 API

### Buscar produtos

```http
GET /produtos
```

Exemplo:

```text
https://reliable-encouragement-production-bd03.up.railway.app/produtos
```

A API retorna os produtos armazenados no banco em formato JSON.

---

## ⚙️ Executando o projeto localmente

### 1. Clone o repositório

```bash
git clone https://github.com/kalleb2cardoso/estoque.git
```

### 2. Entre na pasta

```bash
cd estoque
```

### 3. Instale as dependências

```bash
npm install
```

### 4. Configure o `.env`

Crie um arquivo chamado `.env` na raiz do projeto:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=SUA_SENHA
DB_NAME=estoque
PORT=3000
```

> Nunca coloque sua senha real do banco de dados no GitHub.

### 5. Inicie o servidor

```bash
node server.js
```

Ou:

```bash
npm start
```

Depois acesse:

```text
http://localhost:3000
```

---

## ☁️ Deploy

A aplicação está hospedada no **Railway**.

No ambiente de produção, o projeto possui dois serviços principais:

```text
Internet
    ↓
Node.js + Express
    ↓
MySQL Railway
```

As credenciais do banco são armazenadas através das **Environment Variables** do Railway, evitando expor senhas e informações sensíveis no código-fonte.

---

## 🔐 Segurança

Arquivos e informações sensíveis não devem ser enviados para o GitHub.

O `.gitignore` inclui:

```gitignore
node_modules/
.env
```

Dessa forma:

- `node_modules` pode ser reconstruído através do `npm install`;
- `.env` permanece apenas no ambiente local;
- senhas do banco não ficam públicas no repositório.

---

## 📚 Aprendizados

Durante o desenvolvimento deste projeto foram praticados conceitos como:

- Estruturação de páginas com HTML
- Estilização com CSS
- Manipulação do DOM com JavaScript
- Desenvolvimento de API com Express
- Integração entre Node.js e MySQL
- Consultas SQL
- Variáveis de ambiente
- Uso de `.env`
- Proteção de credenciais com `.gitignore`
- Git e GitHub
- Deploy de aplicações
- Banco de dados em ambiente de produção
- Comunicação entre front-end, back-end e banco de dados

---

## 🔮 Próximas melhorias

Algumas funcionalidades planejadas para evolução do sistema:

- [ ] Entrada de produtos
- [ ] Saída de produtos
- [ ] Histórico completo de movimentações
- [ ] Alertas de produtos próximos da validade
- [ ] Controle por lote
- [ ] Leitura de código de barras
- [ ] Edição de produtos
- [ ] Exclusão de produtos
- [ ] Autenticação de usuários
- [ ] Diferentes níveis de acesso
- [ ] Relatórios de estoque
- [ ] Melhorias na responsividade para celulares
- [ ] Dashboard com gráficos

---

## 👨‍💻 Autor

**Kalleb Cardoso**

Projeto desenvolvido para estudo e evolução em **Análise e Desenvolvimento de Sistemas**.

GitHub: **kalleb2cardoso**