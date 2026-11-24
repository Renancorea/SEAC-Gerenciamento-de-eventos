const btnParticipante = document.getElementById("btnParticipante");
const btnOrganizador = document.getElementById("btnOrganizador");
const indicador = document.querySelector(".indicador");
const labelIdentificacao = document.getElementById("labelIdentificacao");
const identificacao = document.getElementById("identificacao");
const senha = document.getElementById("senha");
const toggleSenha = document.getElementById("toggleSenha");
const botaoEntrar = document.querySelector(".botao-entrar");
const mensagemErro = document.getElementById("mensagemErro");

let tipoUsuario = "participante";

function mostrarMensagem(texto) {
    if (mensagemErro) {
        mensagemErro.textContent = texto || "";
    }
}

function selecionarTipo(tipo) {
    tipoUsuario = tipo;
    const participante = tipo === "participante";
    btnParticipante.classList.toggle("ativo", participante);
    btnOrganizador.classList.toggle("ativo", !participante);
    indicador.style.transform = participante ? "translateX(0)" : "translateX(100%)";
    labelIdentificacao.textContent = participante ? "Matrícula" : "SIAPE";
    identificacao.placeholder = participante ? "Digite sua matrícula" : "Digite seu SIAPE";
    identificacao.value = "";
    mostrarMensagem("");
    identificacao.focus();
}

btnParticipante.addEventListener("click", () => selecionarTipo("participante"));
btnOrganizador.addEventListener("click", () => selecionarTipo("organizador"));

toggleSenha?.addEventListener("click", () => {
    senha.type = senha.type === "password" ? "text" : "password";
});

document.getElementById("linkEsqueci")?.addEventListener("click", (e) => {
    e.preventDefault();
    mostrarMensagem("Recuperação de senha ainda não disponível no servidor.");
});

document.querySelectorAll(".opcao-social").forEach((btn) => {
    btn.addEventListener("click", () => {
        const provedor = btn.dataset.social || "externo";
        mostrarMensagem(`Login via ${provedor} ainda não está configurado no servidor.`);
    });
});

botaoEntrar.addEventListener("click", entrar);
[identificacao, senha].forEach((campo) => campo.addEventListener("keydown", (event) => {
    if (event.key === "Enter") entrar();
}));

async function entrar() {
    const id = identificacao.value.trim();
    const senhaPreenchida = senha.value;

    if (!id || !senhaPreenchida) {
        mostrarMensagem("Preencha sua identificação e senha para entrar.");
        return;
    }

    mostrarMensagem("");
    botaoEntrar.disabled = true;

    try {
        const res = await SEACApi.apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                identificador: id,
                senha: senhaPreenchida,
                tipo: tipoUsuario === "organizador" ? 0 : 1
            })
        });

        SEACApi.saveSession(res.token, res.usuario);
        window.location.href = Number(res.usuario.tipo) === 0 ? "/organizador/" : "/participante/";
    } catch (erro) {
        mostrarMensagem(erro.message || "Identificação, tipo de conta ou senha incorretos.");
    } finally {
        botaoEntrar.disabled = false;
    }
}
