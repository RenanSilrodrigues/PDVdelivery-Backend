const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = 5000;
const pool = require('./db');

app.use(cors());
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const SECRET_KEY = '22781';

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

app.get('/api/itens', async (req, res) => {
    const descricao = req.query.descricao; 
  
    try {
      const query = 'SELECT descricao, valor FROM produtos WHERE descricao ILIKE $1';
      const result = await pool.query(query, [`%${descricao}%`]); 
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).json({ error: 'Erro no servidor' });
    }
});

app.get('/api/pedidos', async (req, res) => {
    try{
        const result = await pool.query('SELECT * FROM pedidos');
        const pedidos = result.rows;
        res.json(pedidos);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: 'Erro no servidor' });
        }
});

app.get('/api/clientes', async (req, res) => {
    const search = req.query.search;

    try {
        let query = 'SELECT telefone, cep, endereco, numero, bairro, complemento, nome FROM clientes';
        const values = [];

        if (search) {
            query += ' WHERE telefone ILIKE $1';
            values.push(`%${search}%`);
        }

        const result = await pool.query(query, values);
        const clientes = result.rows;
        res.json(clientes);
    } catch (err) {
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

app.post('/api/pedidos', async (req, res) => {
    try{
        const {telefone, produtos, pagamento, total, data} = req.body;
        console.log(req.body);

        const result = await pool.query(
            'INSERT INTO pedidos (telefone, produtos, pagamento, total, data) VALUES ($1, $2, $3, $4, $5) RETURNING *',
                [telefone, produtos, pagamento, total, data]
        );

        const pedidos = result.rows[0];

        res.status(201).json({ pedidos });

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
    const { nome, username, telefone, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO usuarios (nome, username, telefone, password) VALUES ($1, $2, $3, $4)', [nome, username, telefone, hashedPassword]);
        res.send()
    } catch (error) {
        console.error(error);
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await pool.query('SELECT * FROM usuarios WHERE username = $1', [username]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha incorreta' });
        }

        const token = jwt.sign({ userId: user.id }, SECRET_KEY, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro no servidor' });
    }
});


app.listen(PORT, () => {
    console.log(`Servidor online na porta ${PORT}`);
    }); 

