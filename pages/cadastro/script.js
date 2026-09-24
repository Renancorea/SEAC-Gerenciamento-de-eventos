const formulario = document.querySelector("form");

formulario.addEventListener("submit", function (event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const matricula = document.getElementById("matricula").value.trim();
    const email = document.getElementById("email").value.trim();
    const tipo = document.getElementById("tipo").value;
    const senha = document.getElementById("senha").value;
    const confirmar = document.getElementById("confirmar").value;

    if (!nome || !matricula || !email || !tipo || !senha || !confirmar) {
        alert("Preencha todos os campos para criar sua conta.");
        return;
    }

    if (senha !== confirmar) {
        alert("As senhas não coincidem.");
        return;
    }

    localStorage.setItem("seacNomeUsuario", nome);
    localStorage.setItem("seacMatricula", matricula);
    localStorage.setItem("seacEmail", email);
    localStorage.setItem("seacTipoUsuario", tipo);

    window.location.href = "../inicio/";
});
