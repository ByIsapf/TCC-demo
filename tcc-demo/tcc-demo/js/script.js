const background = document.getElementById("background-effects");

const quantidade = 35;

for (let i = 0; i < quantidade; i++) {

    const particle = document.createElement("div");

    particle.classList.add("particle");

    particle.style.left = Math.random() * 100 + "%";

    particle.style.animationDuration =
        (Math.random() * 10 + 8) + "s";

    particle.style.animationDelay =
        (Math.random() * 8) + "s";

    const tamanho = Math.random() * 5 + 2;

    particle.style.width = tamanho + "px";
    particle.style.height = tamanho + "px";

    background.appendChild(particle);
}


// =========================
// LOGIN DO ALUNO
// =========================

const form = document.getElementById("formstudent");

form.addEventListener("submit", async function (event) {

    // Impede o formulário de recarregar a página
    event.preventDefault();

    // Pega os valores digitados
    const ra = document.getElementById("ra").value;
    const senha = document.getElementById("password").value;

    try {

        // Envia os dados para o backend
        const resposta = await fetch("/alunos/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                ra: ra,
                senha: senha
            })
        });

        const dados = await resposta.json();

        // Se o login estiver correto
        if (resposta.ok) {

            alert("Login realizado com sucesso!");

            console.log("Aluno logado:", dados.aluno);


            // =========================
            // GERA O QR CODE
            // =========================

            const qrArea = document.getElementById("qrcode");

            // Limpa o conteúdo anterior
            qrArea.innerHTML = "";

            // Cria o endereço da página de presença
            const urlPresenca =
                new URL("presenca.html?token=" + encodeURIComponent(dados.token), window.location.href).href;

            // Gera o QR Code
            new QRCode(qrArea, {
                text: urlPresenca,
                width: 190,
                height: 190
            });

        } else {

            // Se RA ou senha estiverem errados
            alert(dados.mensagem);

        }

    } catch (erro) {

        console.error("Erro ao conectar com o backend:", erro);

        alert("Não foi possível conectar ao servidor.");

    }

});