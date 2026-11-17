(function () {
    const formCadastro = document.getElementById("formCadastro");
    const inputNome = document.getElementById("nome");
    const selectTipo = document.getElementById("tipo");
    const labelIdentificacao = document.getElementById("labelIdentificacaoCadastro");
    const inputIdentificacao = document.getElementById("matricula");
    const inputEmail = document.getElementById("email");
    const inputSenha = document.getElementById("senha");
    const inputConfirmar = document.getElementById("confirmar");
    const btnCadastrar = document.getElementById("btnCadastrar");
    const feedback = document.getElementById("feedbackCadastro");

    function mostrarFeedback(mensagem, tipo = "erro") {
        feedback.textContent = mensagem;
        feedback.className = `feedback-mensagem ${tipo}`;
        feedback.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function limparFeedback() {
        feedback.textContent = "";
        feedback.className = "feedback-mensagem";
    }

    selectTipo.addEventListener("change", () => {
        limparFeedback();
        if (selectTipo.value === "organizador") {
            labelIdentificacao.textContent = "SIAPE";
            inputIdentificacao.placeholder = "Digite seu SIAPE";
        } else {
            labelIdentificacao.textContent = "Matrícula";
            inputIdentificacao.placeholder = "Digite sua matrícula";
        }
    });

    formCadastro.addEventListener("submit", async (e) => {
        e.preventDefault();
        limparFeedback();

        const nome = inputNome.value.trim();
        const tipoStr = selectTipo.value;
        const identificacao = inputIdentificacao.value.trim();
        const email = inputEmail.value.trim().toLowerCase();
        const senha = inputSenha.value;
        const confirmar = inputConfirmar.value;

        if (!nome) {
            mostrarFeedback("Informe seu nome completo.");
            inputNome.focus();
            return;
        }

        if (!tipoStr) {
            mostrarFeedback("Selecione o tipo de usuário (Participante ou Organizador).");
            selectTipo.focus();
            return;
        }

        const tipoNumerico = tipoStr === "organizador" ? 0 : 1;

        if (!identificacao) {
            mostrarFeedback(
                tipoNumerico === 0
                    ? "Informe o número do SIAPE."
                    : "Informe o número de matrícula."
            );
            inputIdentificacao.focus();
            return;
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            mostrarFeedback("Informe um endereço de e-mail válido.");
            inputEmail.focus();
            return;
        }

        if (!senha || senha.length < 6) {
            mostrarFeedback("A senha deve possuir pelo menos 6 caracteres.");
            inputSenha.focus();
            return;
        }

        if (senha !== confirmar) {
            mostrarFeedback("As senhas digitadas não coincidem.");
            inputConfirmar.focus();
            return;
        }

        const payload = {
            nome,
            email,
            tipo: tipoNumerico,
            senha,
            matricula: tipoNumerico === 1 ? identificacao : null,
            siape: tipoNumerico === 0 ? identificacao : null
        };

        btnCadastrar.disabled = true;
        btnCadastrar.textContent = "Cadastrando...";

        try {
            await SEACApi.apiRequest("/usuarios/cadastrar", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            mostrarFeedback("Cadastro realizado com sucesso! Redirecionando para o login...", "sucesso");
            formCadastro.reset();
            labelIdentificacao.textContent = "Matrícula";
            inputIdentificacao.placeholder = "Digite sua matrícula";

            setTimeout(() => {
                window.location.href = "../login/";
            }, 1200);
        } catch (erro) {
            mostrarFeedback(erro.message || "Não foi possível concluir o cadastro.");
            btnCadastrar.disabled = false;
            btnCadastrar.textContent = "Cadastrar";
        }
    });
})();
