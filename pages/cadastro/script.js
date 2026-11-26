const formulario = document.getElementById("formCadastro");
const identificacao = document.getElementById("identificacao");
const rotuloIdentificacao = document.getElementById("rotulo-identificacao");
const opcoesTipo = document.querySelectorAll('input[name="tipo"]');
const mensagemErro = document.getElementById("mensagemErro");

function mostrarMensagem(texto) {
    if (mensagemErro) {
        mensagemErro.textContent = texto || "";
    }
}

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

formulario.addEventListener("submit", async function (event) {
    event.preventDefault();
    mostrarMensagem("");

    const nome = document.getElementById("nome").value.trim();
    const identificacaoValor = identificacao.value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const tipoValor = obterTipoSelecionado();
    const tipoNumerico = tipoValor === "organizador" ? 0 : 1;
    const senha = document.getElementById("senha").value;
    const confirmar = document.getElementById("confirmar").value;

    if (!nome || !identificacaoValor || !email || !senha || !confirmar) {
        mostrarMensagem("Preencha todos os campos para criar sua conta.");
        return;
    }
    if (senha.length < 6) {
        mostrarMensagem("A senha deve ter pelo menos 6 caracteres.");
        return;
    }
    if (senha !== confirmar) {
        mostrarMensagem("As senhas não coincidem.");
        return;
    }

    const botao = formulario.querySelector(".botao-cadastrar");
    if (botao) botao.disabled = true;

    try {
        const payload = {
            nome,
            email,
            tipo: tipoNumerico,
            senha
        };

        if (tipoNumerico === 0) {
            payload.siape = identificacaoValor;
        } else {
            payload.matricula = identificacaoValor;
        }

        await SEACApi.apiRequest("/usuarios/cadastrar", {
            method: "POST",
            body: JSON.stringify(payload)
        });

        const loginRes = await SEACApi.apiRequest("/auth/login", {
            method: "POST",
            body: JSON.stringify({
                identificador: identificacaoValor,
                senha,
                tipo: tipoNumerico
            })
        });

        SEACApi.saveSession(loginRes.token, loginRes.usuario);
        window.location.href = tipoNumerico === 0 ? "/organizador/" : "/participante/";
    } catch (erro) {
        mostrarMensagem(erro.message || "Erro ao criar conta.");
    } finally {
        if (botao) botao.disabled = false;
    }
});
