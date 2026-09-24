const btnParticipante = document.getElementById("btnParticipante");
const btnOrganizador = document.getElementById("btnOrganizador");
const indicador = document.querySelector(".indicador");
const labelIdentificacao = document.getElementById("labelIdentificacao");
const identificacao = document.getElementById("identificacao");
const senha = document.getElementById("senha");
const botaoEntrar = document.querySelector(".botao-entrar");

let tipoUsuario = "participante";

btnParticipante.addEventListener("click", function () {
    tipoUsuario = "participante";
    btnParticipante.classList.add("ativo");
    btnOrganizador.classList.remove("ativo");
    indicador.style.transform = "translateX(0)";
    labelIdentificacao.textContent = "Matrícula";
    identificacao.placeholder = "Digite sua matrícula";
});

btnOrganizador.addEventListener("click", function () {
    tipoUsuario = "organizador";
    btnOrganizador.classList.add("ativo");
    btnParticipante.classList.remove("ativo");
    indicador.style.transform = "translateX(100%)";
    labelIdentificacao.textContent = "SIAPE";
    identificacao.placeholder = "Digite seu SIAPE";
});

botaoEntrar.addEventListener("click", function () {
    const identificacaoPreenchida = identificacao.value.trim();
    const senhaPreenchida = senha.value.trim();

    if (!identificacaoPreenchida || !senhaPreenchida) {
        alert("Preencha seu usuário e sua senha para entrar.");
        return;
    }

    localStorage.setItem("seacUsuario", identificacaoPreenchida);
    localStorage.setItem("seacTipoUsuario", tipoUsuario);
    window.location.href = "../inicio/";
});
