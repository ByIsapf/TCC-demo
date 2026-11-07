// =========================
// ELEMENTOS DA PÁGINA
// =========================

const statusIcon = document.getElementById("status-icon");
const statusTitulo = document.getElementById("status-titulo");
const statusMensagem = document.getElementById("status-mensagem");

const dadosPresenca = document.getElementById("dados-presenca");

const nomeAluno = document.getElementById("nome-aluno");
const dataPresenca = document.getElementById("data-presenca");
const horarioPresenca = document.getElementById("horario-presenca");


// =========================
// PEGA O TOKEN DA URL
// =========================

const parametros = new URLSearchParams(window.location.search);

const token = parametros.get("token");


// =========================
// REGISTRA A PRESENÇA
// =========================

async function registrarPresenca() {

    if (!token) {

        mostrarErro(
            "QR Code inválido",
            "Não foi possível identificar este QR Code."
        );

        return;
    }


    try {

        const resposta = await fetch(
            `/qr/registrar?token=${encodeURIComponent(token)}`
        );

        const dados = await resposta.json();


        // =========================
        // PRESENÇA REGISTRADA
        // =========================

        if (resposta.ok) {

            statusIcon.textContent = "✓";

            statusTitulo.textContent =
                "Presença registrada!";

            statusMensagem.textContent =
                "Sua presença foi registrada com sucesso.";


            nomeAluno.textContent =
                dados.aluno.nome;

            dataPresenca.textContent =
                dados.presenca.data;

            horarioPresenca.textContent =
                dados.presenca.horario;

        }

        // =========================
        // ALGUM ERRO
        // =========================

        else {

            mostrarErro(
                "Não foi possível registrar",
                dados.mensagem
            );

        }


    } catch (erro) {

        console.error(
            "Erro ao registrar presença:",
            erro
        );

        mostrarErro(
            "Erro de conexão",
            "Não foi possível conectar ao servidor."
        );

    }

}


// =========================
// MOSTRA ERRO NA TELA
// =========================

function mostrarErro(titulo, mensagem) {

    statusIcon.textContent = "×";

    statusTitulo.textContent = titulo;

    statusMensagem.textContent = mensagem;

    dadosPresenca.style.display = "none";

}


// Executa quando a página abre
registrarPresenca();