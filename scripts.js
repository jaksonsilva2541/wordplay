    // Função para pesquisar histórias
function pesquisar() {
    const termo = document.getElementById('search').value.toLowerCase();
    const historias = document.querySelectorAll('.story-item');

    historias.forEach(historia => {
        const titulo = historia.querySelector('p').textContent.toLowerCase();
        if (titulo.includes(termo)) {
            historia.style.display = 'block';
        } else {
            historia.style.display = 'none';
        }
    });
}

// Função para selecionar uma história
function selecionarHistoria(id) {
    // Salva o ID da história selecionada no localStorage
    localStorage.setItem('historiaSelecionada', id);
    // Redireciona para a página de leitura
    window.location.href = 'leitura.html';
}

// Função para carregar a história na página de leitura
function carregarHistoria() {
    const id = localStorage.getItem('historiaSelecionada');
    const conteudoHistoria = document.getElementById('conteudoHistoria');

    if (id) {
        conteudoHistoria.innerHTML = `<p>Conteúdo da História ${id}</p>`;
    } else {
        conteudoHistoria.innerHTML = `<p>História não encontrada.</p>`;
    }
}

// Função para concluir a leitura e redirecionar para a página de seleção
function concluirLeitura() {
    alert("Leitura concluída!");
    window.location.href = 'pergunta.html'; // Redireciona para a página de perguntas
}

// Verifica se estamos na página de leitura e carrega a história
if (window.location.pathname.includes('leitura.html')) {
    carregarHistoria();
}

// Função para alternar entre os formulários de login e cadastro
function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}


function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert("As senhas não coincidem.");
        return;
    }

    alert("Usuário cadastrado com sucesso!");
    toggleForms();
}


function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;


    const defaultUsername = "usuario";
    const defaultPassword = "senha123";

    if (username === defaultUsername && password === defaultPassword) {
        alert("Login realizado com sucesso!");
        window.location.href = 'selecionar_historia.html'; // Redireciona para a tela de seleção de história
    } else {
        alert("Usuário ou senha incorretos.");
    }
}
const API_URL = 'http://localhost:3000';

// Função para cadastrar um usuário
async function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert("As senhas não coincidem.");
        return;
    }

    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    alert(data.message);
    if (response.ok) toggleForms();
}

// Função para logar um usuário
async function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    alert(data.message);
    if (response.ok) {
        localStorage.setItem('userId', data.userId);
        window.location.href = 'selecionar_historia.html';
    }
}

// Função para carregar histórias
async function carregarHistorias() {
    const response = await fetch(`${API_URL}/historias`);
    const historias = await response.json();
    const lista = document.getElementById('listaHistorias');
    lista.innerHTML = '';
    historias.forEach(historia => {
        const item = document.createElement('div');
        item.className = 'story-item';
        item.innerHTML = `<p>${historia.titulo}</p>`;
        item.onclick = () => selecionarHistoria(historia.id);
        lista.appendChild(item);
    });
}

// Função para registrar progresso da leitura
async function concluirLeitura() {
    const userId = localStorage.getItem('userId');
    const historiaId = localStorage.getItem('historiaSelecionada');
    if (!userId || !historiaId) return;

    await fetch(`${API_URL}/progresso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: userId, historia_id: historiaId, concluido: true })
    });
    
    alert("Leitura concluída!");
   window.location.href = 'pergunta.html';
}

// Executa o carregamento das histórias se estiver na página correta
if (window.location.pathname.includes('selecionar_historia.html')) {
    carregarHistorias();
}

