const formulario = document.getElementById("formCadastro");
const identificacao = document.getElementById("identificacao");
const rotuloIdentificacao = document.getElementById("rotulo-identificacao");
const opcoesTipo = document.querySelectorAll('input[name="tipo"]');

function obterTipoSelecionado() {
    return document.querySelector('input[name="tipo"]:checked')?.value || "participante";
}

function atualizarIdentificacao() {
    const organizador = obterTipoSelecionado() === "organizador";
    identificacao.placeholder = organizador ? "Digite seu SIAPE" : "Digite sua matrícula";
    rotuloIdentificacao.textContent = organizador ? "SIAPE" : "MATRÍCULA";
    document.querySelectorAll(".opcao-tipo").forEach((opcao) => {
        opcao.classList.toggle("selecionada", opcao.querySelector("input").checked);
    });
}

opcoesTipo.forEach((opcao) => opcao.addEventListener("change", atualizarIdentificacao));
atualizarIdentificacao();

formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const identificacaoValor = identificacao.value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const tipoValor = obterTipoSelecionado();
    const senha = document.getElementById("senha").value;
    const confirmar = document.getElementById("confirmar").value;

    if (!nome || !identificacaoValor || !email || !senha || !confirmar) {
        alert("Preencha todos os campos para criar sua conta.");
        return;
    }
    if (senha.length < 6) {
        alert("A senha deve ter pelo menos 6 caracteres.");
        return;
    }
    if (senha !== confirmar) {
        alert("As senhas não coincidem.");
        return;
    }

    const usuarios = JSON.parse(localStorage.getItem("seacUsuarios") || "[]");
    const identificacaoExiste = usuarios.some(usuario =>
        usuario.tipo === tipoValor &&
        usuario.identificacao.toLowerCase() === identificacaoValor.toLowerCase()
    );
    const emailExiste = usuarios.some(usuario => usuario.email.toLowerCase() === email);

    if (identificacaoExiste) {
        alert(tipoValor === "organizador"
            ? "Já existe uma conta com esse SIAPE."
            : "Já existe uma conta com essa matrícula.");
        return;
    }
    if (emailExiste) {
        alert("Já existe uma conta cadastrada com esse e-mail.");
        return;
    }

    const novoUsuario = { nome, identificacao: identificacaoValor, email, tipo: tipoValor, senha };
    usuarios.push(novoUsuario);
    localStorage.setItem("seacUsuarios", JSON.stringify(usuarios));
    sessionStorage.setItem("seacUsuarioLogado", JSON.stringify({
        nome: novoUsuario.nome,
        identificacao: novoUsuario.identificacao,
        email: novoUsuario.email,
        tipo: novoUsuario.tipo
    }));

    // Compatibilidade com partes anteriores do protótipo.
    localStorage.setItem("seacNomeUsuario", nome);
    localStorage.setItem("seacUsuario", identificacaoValor);
    localStorage.setItem("seacTipoUsuario", tipoValor);

    window.location.href = tipoValor === "organizador" ? "../organizador/" : "../participante/";
});
