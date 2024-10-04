const express = require('express');
const app = express();
const PORT = 5000;
const pool = require('./db');


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

        await pool.query(
            'INSERT INTO Produtos (Tipo, Descricao, Valor) VALUES ($1, $2, $3) RETURNING *',
                [tipo, descricao, valor]
        );

        res.json({message: 'Produto inserido com sucesso!'});

        }catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');

        }
});

app.post('/api/clientes', async (req, res) => {
    try{
        const {telefone, cep, endereco, numero, bairro, complemento, nomecliente} = req.body;
        console.log(telefone, cep, endereco, numero, bairro, complemento, nomecliente);

        await pool.query(
            'INSERT INTO Clientes (telefone, cep, endereco, numero, bairro, complemento, nome) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
                [telefone, cep, endereco, numero, bairro, complemento, nomecliente]
        );

        }catch (err) {
            console.error(err.message);
            res.status(500).send('Erro no servidor');

        }
});



app.listen(PORT, () => {
    console.log(`Servidor online na porta ${PORT}`);
    }); 

