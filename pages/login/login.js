const btnParticipante = document.getElementById("btnParticipante");
const btnOrganizador = document.getElementById("btnOrganizador");
const indicador = document.querySelector(".indicador");
const labelIdentificacao = document.getElementById("labelIdentificacao");
const identificacao = document.getElementById("identificacao");
const senha = document.getElementById("senha");
const botaoEntrar = document.querySelector(".botao-entrar");

let tipoUsuario = "participante";

function selecionarTipo(tipo) {
    tipoUsuario = tipo;
    const participante = tipo === "participante";
    btnParticipante.classList.toggle("ativo", participante);
    btnOrganizador.classList.toggle("ativo", !participante);
    indicador.style.transform = participante ? "translateX(0)" : "translateX(100%)";
    labelIdentificacao.textContent = participante ? "Matrícula" : "SIAPE";
    identificacao.placeholder = participante ? "Digite sua matrícula" : "Digite seu SIAPE";
    identificacao.value = "";
    identificacao.focus();
}

btnParticipante.addEventListener("click", () => selecionarTipo("participante"));
btnOrganizador.addEventListener("click", () => selecionarTipo("organizador"));

botaoEntrar.addEventListener("click", entrar);
[identificacao, senha].forEach(campo => campo.addEventListener("keydown", event => {
    if (event.key === "Enter") entrar();
}));

function entrar() {
    const id = identificacao.value.trim();
    const senhaPreenchida = senha.value;

    if (!id || !senhaPreenchida) {
        alert("Preencha sua identificação e senha para entrar.");
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem("seacUsuarios") || "[]");
    const usuario = usuarios.find(item =>
        item.tipo === tipoUsuario &&
        item.identificacao.toLowerCase() === id.toLowerCase() &&
        item.senha === senhaPreenchida
    );

    if (!usuario) {
        alert("Identificação, tipo de conta ou senha incorretos. Confira os dados ou faça seu cadastro.");
        return;
    }

    sessionStorage.setItem("seacUsuarioLogado", JSON.stringify({
        nome: usuario.nome,
        identificacao: usuario.identificacao,
        email: usuario.email,
        tipo: usuario.tipo
    }));

    localStorage.setItem("seacNomeUsuario", usuario.nome);
    localStorage.setItem("seacUsuario", usuario.identificacao);
    localStorage.setItem("seacTipoUsuario", usuario.tipo);

    window.location.href = usuario.tipo === "organizador" ? "../organizador/" : "../participante/";
}
