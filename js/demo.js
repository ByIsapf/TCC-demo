/* ==========================================
   G.E.A | MODO DEMONSTRAÇÃO
   Simula o servidor (Node.js + MySQL) no navegador,
   com dados fictícios. O código das telas é o do projeto real.
   ========================================== */

(function () {

    const REPO = "https://github.com/ByIsapf/TCC_gerenciamento_de_alunos";
    const RA = "12345678";
    const SENHA = "demo123";
    const NOME = "Aluno Demonstração";

    const KEY_DIA = "gea-demo-presenca";
    const KEY_USADOS = "gea-demo-tokens-usados";

    // ---------- armazenamento (com proteção) ----------

    const guardar = (chave, valor) => { try { localStorage.setItem(chave, valor); } catch {} };
    const ler = (chave) => { try { return localStorage.getItem(chave); } catch { return null; } };
    const apagar = (chave) => { try { localStorage.removeItem(chave); } catch {} };

    const pad = (n) => String(n).padStart(2, "0");
    const hoje = () => new Date().toLocaleDateString("pt-BR");
    const usados = () => { try { return JSON.parse(ler(KEY_USADOS)) || []; } catch { return []; } };

    // ---------- servidor simulado ----------

    const responder = (status, corpo) =>
        new Response(JSON.stringify(corpo), {
            status,
            headers: { "Content-Type": "application/json" }
        });

    const fetchReal = window.fetch.bind(window);

    window.fetch = async function (url, opcoes = {}) {

        const endereco = String(url);

        // POST /alunos/login
        if (endereco.includes("/alunos/login")) {

            let dados = {};
            try { dados = JSON.parse(opcoes.body); } catch {}

            if (dados.ra !== RA || dados.senha !== SENHA) {
                return responder(401, { mensagem: "RA ou senha inválidos." });
            }

            // o token guarda o próprio prazo de 1 minuto, assim o QR
            // também funciona se for lido pelo celular
            const validade = Date.now() + 60 * 1000;
            const aleatorio = Math.random().toString(16).slice(2, 12);
            const token = `${validade}.${aleatorio}`;

            setTimeout(() => mostrarBotaoLeitura(token), 400);

            return responder(200, {
                mensagem: "Login realizado com sucesso!",
                aluno: { id: 1, ra: RA, nome: NOME },
                token
            });
        }

        // GET /qr/registrar?token=...
        if (endereco.includes("/qr/registrar")) {

            const token = new URL(endereco, location.href).searchParams.get("token");

            if (!token || !/^\d+\.[0-9a-f]+$/.test(token)) {
                return responder(401, { mensagem: "QR Code inválido." });
            }
            if (usados().includes(token)) {
                return responder(401, { mensagem: "Este QR Code já foi utilizado." });
            }
            if (Number(token.split(".")[0]) < Date.now()) {
                return responder(401, { mensagem: "Este QR Code expirou." });
            }
            if (ler(KEY_DIA) === hoje()) {
                return responder(409, { mensagem: "Sua presença já foi registrada hoje." });
            }

            const agora = new Date();
            guardar(KEY_DIA, hoje());
            guardar(KEY_USADOS, JSON.stringify([...usados(), token]));

            return responder(200, {
                mensagem: "Presença registrada com sucesso!",
                aluno: { nome: NOME },
                presenca: { data: hoje(), horario: `${pad(agora.getHours())}:${pad(agora.getMinutes())}` }
            });
        }

        return fetchReal(url, opcoes);
    };

    // ---------- aviso fixo ----------

    function criarAviso() {
        const barra = document.createElement("div");
        barra.className = "demo-bar";
        barra.innerHTML =
            `<span>Demonstração com dados fictícios. O sistema real usa Node.js e MySQL.</span>` +
            `<a href="${REPO}" target="_blank" rel="noopener noreferrer">Ver código no GitHub</a>` +
            `<button type="button" id="demo-reiniciar">Reiniciar demonstração</button>`;
        document.body.appendChild(barra);

        document.getElementById("demo-reiniciar").addEventListener("click", () => {
            apagar(KEY_DIA);
            apagar(KEY_USADOS);
            location.href = new URL(location.pathname.includes("/gestao/") || location.pathname.includes("/secretaria/")
                ? "../index.html" : "index.html", location.href).href;
        });
    }

    function avisar(texto) {
        const antigo = document.querySelector(".demo-toast");
        if (antigo) antigo.remove();

        const toast = document.createElement("div");
        toast.className = "demo-toast";
        toast.textContent = texto;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2600);
    }

    // ---------- tela do aluno ----------

    function prepararLogin() {
        const ra = document.getElementById("ra");
        const senha = document.getElementById("password");
        const formulario = document.getElementById("formstudent");
        if (!ra || !senha || !formulario) return;

        ra.value = RA;
        senha.value = SENHA;

        const dica = document.createElement("p");
        dica.className = "demo-hint";
        dica.textContent = `Dados de teste já preenchidos (RA ${RA}, senha ${SENHA}).`;
        formulario.after(dica);
    }

    function mostrarBotaoLeitura(token) {
        const area = document.querySelector(".qr-content");
        if (!area) return;

        const antigo = document.getElementById("demo-leitura");
        if (antigo) antigo.remove();

        const link = document.createElement("a");
        link.id = "demo-leitura";
        link.className = "demo-btn";
        link.href = new URL("presenca.html?token=" + encodeURIComponent(token), location.href).href;
        link.textContent = "Simular leitura do QR Code";
        area.appendChild(link);
    }

    // ---------- painel da gestão ----------

    const NOMES = [
        "Ana Beatriz Souza", "Bruno Henrique Lima", "Camila Rocha", "Daniel Ferreira",
        "Eduarda Martins", "Felipe Santos", "Gabriela Alves", "Heitor Oliveira",
        "Isadora Costa", "João Pedro Ribeiro", "Larissa Mendes", "Mateus Carvalho"
    ];

    function prepararTurmas() {
        const seletor = document.getElementById("selectTurma");
        const secao = document.getElementById("alunosSection");
        if (!seletor || !secao) return;

        seletor.addEventListener("change", () => {
            const indice = seletor.selectedIndex;
            const quantidade = 6 + (indice % 4);

            document.getElementById("tituloTurma").textContent = `Turma ${seletor.value}`;
            document.getElementById("contadorAlunos").textContent = `${quantidade} alunos`;

            const antiga = secao.querySelector(".demo-lista");
            if (antiga) antiga.remove();

            const lista = document.createElement("ul");
            lista.className = "demo-lista";

            for (let i = 0; i < quantidade; i++) {
                const item = document.createElement("li");
                const nome = document.createElement("span");
                const situacao = document.createElement("small");

                nome.textContent = NOMES[(indice * 3 + i) % NOMES.length];
                situacao.textContent = (i + indice) % 5 === 0 ? "Ausente" : "Presente";

                item.append(nome, situacao);
                lista.appendChild(item);
            }

            secao.appendChild(lista);
        });
    }

    // telas que ainda não existem no projeto
    document.addEventListener("click", (evento) => {
        const link = evento.target.closest("a");
        if (!link) return;

        if (/(alunos|frequencia|faltas|notificacoes)\.html$/.test(link.getAttribute("href") || "")) {
            evento.preventDefault();
            avisar("Esta tela ainda está em desenvolvimento.");
        }
    });

    document.addEventListener("DOMContentLoaded", () => {
        criarAviso();
        prepararLogin();
        prepararTurmas();
    });

})();
