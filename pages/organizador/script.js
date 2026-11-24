const busca = document.getElementById("campoBusca");
const tipo = document.getElementById("filtroTipo");
const ordem = document.getElementById("ordenacao");
const grade = document.getElementById("gradeEventos");
const contadorEventos = document.getElementById("contadorEventos");
const semResultados = document.getElementById("semResultados");

let usuarioAtual = null;
let eventosOrganizador = [];

function abrirDetalhes(ev) {
    window.location.href = `detalhes.html?id=${encodeURIComponent(ev.eventoId)}`;
}

function filtrarEventos() {
    const termo = (busca?.value || "").trim().toLowerCase();
    const selecionado = tipo?.value || "todos";

    let lista = eventosOrganizador.filter((ev) => {
        const correspondeTipo = selecionado === "todos" || String(ev.tipo || "").toLowerCase() === selecionado;
        const texto = `${ev.nome || ""} ${ev.organizadorNome || ""} ${ev.local || ""} ${ev.categoria || ""}`.toLowerCase();
        return (!termo || texto.includes(termo)) && correspondeTipo;
    });

    lista.sort((a, b) => {
        const dataA = new Date(a.data);
        const dataB = new Date(b.data);
        return ordem?.value === "desc" ? dataB - dataA : dataA - dataB;
    });

    SEACApi.renderizarCardsEventos(grade, lista, abrirDetalhes);
    contadorEventos.textContent = `${lista.length} ${lista.length === 1 ? "Evento encontrado" : "Eventos encontrados"}`;
    semResultados.style.display = lista.length ? "none" : "block";
}

async function carregarEventos() {
    try {
        const res = await SEACApi.apiRequest("/eventos");
        const todos = res.eventos || [];
        eventosOrganizador = usuarioAtual?.adm
            ? todos
            : todos.filter((ev) => Number(ev.idOrganizador) === Number(usuarioAtual.usuarioId));
    } catch (erro) {
        eventosOrganizador = [];
        semResultados.textContent = erro.message || "Não foi possível carregar os eventos.";
    }
    filtrarEventos();
}

async function sairDaConta() {
    await SEACApi.logout();
    window.location.href = "/login/";
}

async function inicializar() {
    usuarioAtual = await SEACApi.validateSession();
    if (!usuarioAtual) {
        window.location.replace("/login/");
        return;
    }

    if (Number(usuarioAtual.tipo) !== 0) {
        window.location.replace("/participante/");
        return;
    }

    document.getElementById("nomeUsuario").textContent = `Olá, ${usuarioAtual.nome}`;
    await carregarEventos();
}

document.getElementById("sair")?.addEventListener("click", sairDaConta);
document.getElementById("linkSair")?.addEventListener("click", (event) => {
    event.preventDefault();
    sairDaConta();
});

busca?.addEventListener("input", filtrarEventos);
tipo?.addEventListener("change", filtrarEventos);
ordem?.addEventListener("change", filtrarEventos);

// Modal de criação de evento
const modalCriar = document.getElementById("modalCriarEvento");
const formCriar = document.getElementById("formCriarEvento");
const erroCriar = document.getElementById("erroCriarEvento");

function fecharModalCriar() {
    modalCriar?.classList.remove("aberto");
    modalCriar?.setAttribute("aria-hidden", "true");
}

document.getElementById("btnCriarEvento")?.addEventListener("click", (e) => {
    e.preventDefault();
    if (erroCriar) erroCriar.textContent = "";
    modalCriar?.classList.add("aberto");
    modalCriar?.setAttribute("aria-hidden", "false");
});

document.getElementById("fecharCriarModal")?.addEventListener("click", fecharModalCriar);
modalCriar?.addEventListener("click", (e) => {
    if (e.target === modalCriar) fecharModalCriar();
});

formCriar?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (erroCriar) erroCriar.textContent = "";

    try {
        await SEACApi.apiRequest("/eventos/cadastrar", {
            method: "POST",
            body: JSON.stringify({
                nome: document.getElementById("criarNome").value.trim(),
                local: document.getElementById("criarLocal").value.trim(),
                data: document.getElementById("criarData").value,
                horario: document.getElementById("criarHorario").value,
                tipo: document.getElementById("criarTipo").value,
                categoria: document.getElementById("criarCategoria").value.trim(),
                assentos: Number(document.getElementById("criarAssentos").value),
                cargaHoraria: Number(document.getElementById("criarCargaHoraria").value),
                descricao: document.getElementById("criarDescricao").value.trim()
            })
        });

        formCriar.reset();
        fecharModalCriar();
        await carregarEventos();
    } catch (erro) {
        if (erroCriar) erroCriar.textContent = erro.message || "Erro ao cadastrar evento.";
    }
});

inicializar();
