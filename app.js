const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 5000;
const pool = require('./db');

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());


app.get('/api/produtos', async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM produtos');
        const produtos = result.rows;
        res.json(produtos);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro no servidor' });
        }
});

app.get('/api/clientes', async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM clientes');
        const clientes = result.rows;
        res.json(clientes);
    }catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro no servidor' });
        }
});

app.delete('/api/produtos/:id', async (req, res) => {
    try{
        const {id} = req.params;
        await pool.query('DELETE FROM produtos WHERE id = $1', [id]);
        res.json({message: 'Produto deletado com sucesso!'});
    }catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
        }
});

app.post('/api/produtos', async (req, res) => {
    try {
        const {tipo, descricao, valor} = req.body;
        console.log(tipo, descricao, valor);

        const result = await pool.query(
            'INSERT INTO Produtos (Tipo, Descricao, Valor) VALUES ($1, $2, $3) RETURNING *',
                [tipo, descricao, valor]
        );

        const produto = result.rows[0];

        res.status(201).json({ produto });

        }catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');

        }
});

app.post('/api/clientes', async (req, res) => {
    try{
        const {telefone, cep, endereco, numero, bairro, complemento, nomecliente} = req.body;
        console.log(telefone, cep, endereco, numero, bairro, complemento, nomecliente);

        const result = await pool.query(
            'INSERT INTO Clientes (telefone, cep, endereco, numero, bairro, complemento, nome) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [telefone, cep, endereco, numero, bairro, complemento, nomecliente]
        );

        const cliente = result.rows[0];

        res.status(201).json({ cliente });

        }catch (err) {
            console.error(err.message);
            res.status(500).send('Erro no servidor');

        }
});


app.post('/cadastrar', async (req, res) => {
    const { usuario, senha } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(senha, 10);
        await pool.query('INSERT INTO usuarios (usuario, senha) VALUES ($1, $2)', [usuario, hashedPassword]);
        res.send()
    } catch (error) {
        console.error(error);
    }
});

app.post('/login', async (req, res) => {
    const { usuario, senha } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE usuario = $1', [usuario]);
        const user = result.rows[0];
        if (user && await bcrypt.compare(senha, user.senha));
        res.send()
            // Senha correta, redirecionar para a página de sucesso
            // Aqui você pode redirecionar para outra página
            // res.redirect('/home');
    } catch (error) {
        console.error(error);
    }
});


app.listen(PORT, () => {
    console.log(`Servidor online na porta ${PORT}`);
    }); 

