const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Conectar ao banco de dados SQLite3
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log('Conectado ao banco de dados SQLite3.');
    }
});

// Criar tabelas
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS perguntas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        historia_id INTEGER,
        pergunta TEXT NOT NULL,
        resposta_correta TEXT NOT NULL,
        alternativa1 TEXT NOT NULL,
        alternativa2 TEXT NOT NULL,
        alternativa3 TEXT NOT NULL,
        FOREIGN KEY (historia_id) REFERENCES historias(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS historias (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        conteudo TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS pontuacoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        equipe TEXT NOT NULL,
        pontos INTEGER DEFAULT 0
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS progresso (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER,
        historia_id INTEGER,
        concluido BOOLEAN,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
        FOREIGN KEY (historia_id) REFERENCES historias(id)
    )`);
});

// Rota para cadastro de usuário
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(`INSERT INTO usuarios (username, password) VALUES (?, ?)`, [username, hashedPassword], function(err) {
        if (err) {
            return res.status(400).json({ error: 'Usuário já existe!' });
        }
        res.json({ message: 'Usuário cadastrado com sucesso!' });
    });
});

// Rota para login de usuário
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.get(`SELECT * FROM usuarios WHERE username = ?`, [username], async (err, user) => {
        if (err || !user) {
            return res.status(400).json({ error: 'Usuário não encontrado!' });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Senha incorreta!' });
        }

        res.json({ message: 'Login realizado com sucesso!', userId: user.id });
    });
});

// Rota para listar histórias
app.get('/historias', (req, res) => {
    db.all(`SELECT * FROM historias`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Rota para obter uma história pelo ID
app.get('/historias/:id', (req, res) => {
    const { id } = req.params;

    db.get(`SELECT * FROM historias WHERE id = ?`, [id], (err, row) => {
        if (err || !row) {
            return res.status(404).json({ error: 'História não encontrada!' });
        }
        res.json(row);
    });
});

// Rota para registrar progresso na leitura
app.post('/progresso', (req, res) => {
    const { usuario_id, historia_id, concluido } = req.body;

    db.run(`INSERT INTO progresso (usuario_id, historia_id, concluido) VALUES (?, ?, ?)`, [usuario_id, historia_id, concluido], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Progresso registrado!' });
    });
});

// Rota para registrar pontuação da equipe
app.post('/pontuacao', (req, res) => {
    const { equipe, pontos } = req.body;

    db.get(`SELECT * FROM pontuacoes WHERE equipe = ?`, [equipe], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        if (row) {
            // Atualiza a pontuação da equipe
            db.run(`UPDATE pontuacoes SET pontos = pontos + ? WHERE equipe = ?`, [pontos, equipe], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Pontuação atualizada com sucesso!' });
            });
        } else {
            // Se a equipe não existir, cria uma nova entrada
            db.run(`INSERT INTO pontuacoes (equipe, pontos) VALUES (?, ?)`, [equipe, pontos], function(err) {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ message: 'Pontuação registrada com sucesso!' });
            });
        }
    });
});

// Rota para obter o ranking das equipes
app.get('/ranking', (req, res) => {
    db.all(`SELECT equipe, pontos FROM pontuacoes ORDER BY pontos DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Rota para obter perguntas por história
app.get('/perguntas/:historia_id', (req, res) => {
    const { historia_id } = req.params;

    db.all(`SELECT * FROM perguntas WHERE historia_id = ?`, [historia_id], (err, rows) => {
        if (err || !rows.length) {
            return res.status(404).json({ error: 'Perguntas não encontradas para esta história!' });
        }
        res.json(rows);
    });
});
app.get('/', (req, res) => {
  res.send('API do sistema está funcionando!');
});
// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});