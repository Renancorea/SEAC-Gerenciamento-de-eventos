(function () {
    const formLogin = document.getElementById("formLogin");
    const btnParticipante = document.getElementById("btnParticipante");
    const btnOrganizador = document.getElementById("btnOrganizador");
    const labelIdentificacao = document.getElementById("labelIdentificacao");
    const inputIdentificacao = document.getElementById("identificacao");
    const inputSenha = document.getElementById("senhaLogin");
    const toggleSenha = document.getElementById("toggleSenha");
    const btnEntrar = document.getElementById("btnEntrar");
    const feedback = document.getElementById("feedbackLogin");
    const linkEsqueci = document.getElementById("linkEsqueci");
    const btnGoogle = document.getElementById("btnGoogle");
    const btnSuap = document.getElementById("btnSuap");

    let tipoSelecionado = 1; // 1 = Participante, 0 = Organizador

    function mostrarFeedback(mensagem, tipo = "erro") {
        feedback.textContent = mensagem;
        feedback.className = `feedback-mensagem ${tipo}`;
    }

    function limparFeedback() {
        feedback.textContent = "";
        feedback.className = "feedback-mensagem";
    }

    function selecionarPerfil(tipo) {
        tipoSelecionado = tipo;
        limparFeedback();

        if (tipo === 1) {
            btnParticipante.classList.add("ativo");
            btnOrganizador.classList.remove("ativo");
            labelIdentificacao.textContent = "Matrícula";
            inputIdentificacao.placeholder = "Digite sua matrícula";
        } else {
            btnOrganizador.classList.add("ativo");
            btnParticipante.classList.remove("ativo");
            labelIdentificacao.textContent = "SIAPE";
            inputIdentificacao.placeholder = "Digite seu SIAPE";
        }
    }

    btnParticipante.addEventListener("click", () => selecionarPerfil(1));
    btnOrganizador.addEventListener("click", () => selecionarPerfil(0));

    function alternarVisibilidadeSenha() {
        const oculta = inputSenha.type === "password";
        inputSenha.type = oculta ? "text" : "password";
        toggleSenha.style.opacity = oculta ? "1" : "0.65";
    }

    toggleSenha.addEventListener("click", alternarVisibilidadeSenha);
    toggleSenha.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            alternarVisibilidadeSenha();
        }
    });

    linkEsqueci.addEventListener("click", (e) => {
        e.preventDefault();
        mostrarFeedback(
            "Para redefinir sua senha, procure a coordenação do evento ou o setor de TI do IFCE.",
            "info"
        );
    });

    btnGoogle.addEventListener("click", () => {
        mostrarFeedback(
            "O login institucional via Google ainda não está habilitado. Utilize sua Matrícula ou SIAPE.",
            "info"
        );
    });

    btnSuap.addEventListener("click", () => {
        mostrarFeedback(
            "A integração direta com o SUAP está em manutenção. Utilize sua Matrícula ou SIAPE cadastrados.",
            "info"
        );
    });

    formLogin.addEventListener("submit", async (e) => {
        e.preventDefault();
        limparFeedback();

        const identificador = inputIdentificacao.value.trim();
        const senha = inputSenha.value;

        if (!identificador) {
            mostrarFeedback(
                tipoSelecionado === 1
                    ? "Informe sua matrícula para entrar."
                    : "Informe seu SIAPE para entrar."
            );
            inputIdentificacao.focus();
            return;
        }

        if (!senha) {
            mostrarFeedback("Informe sua senha para entrar.");
            inputSenha.focus();
            return;
        }

        btnEntrar.disabled = true;
        btnEntrar.textContent = "Entrando...";

        try {
            const resposta = await SEACApi.apiRequest("/auth/login", {
                method: "POST",
                body: JSON.stringify({
                    identificador,
                    senha,
                    tipo: tipoSelecionado
                })
            });

            SEACApi.saveSession(resposta.token, resposta.usuario);
            mostrarFeedback("Login realizado com sucesso! Redirecionando...", "sucesso");

            setTimeout(() => {
                window.location.href = "../inicio/";
            }, 500);
        } catch (erro) {
            mostrarFeedback(erro.message || "Credenciais inválidas.");
            btnEntrar.disabled = false;
            btnEntrar.textContent = "Entrar";
        }
    });

    // Se já houver sessão válida, redireciona para a página inicial
    SEACApi.validateSession().then((usuario) => {
        if (usuario) {
            window.location.href = "../inicio/";
        }
    });
})();
