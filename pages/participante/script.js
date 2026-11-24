const busca = document.getElementById("campoBusca");
const tipo = document.getElementById("filtroTipo");
const ordem = document.getElementById("ordenacao");
const grade = document.getElementById("gradeEventos");
const contadorEventos = document.getElementById("contadorEventos");
const semResultados = document.getElementById("semResultados");

let todosEventos = [];

function abrirDetalhes(ev) {
    window.location.href = `detalhes.html?id=${encodeURIComponent(ev.eventoId)}`;
}

function filtrarEventos() {
    const termo = (busca?.value || "").trim().toLowerCase();
    const selecionado = tipo?.value || "todos";

    let lista = todosEventos.filter((ev) => {
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

async function sairDaConta() {
    await SEACApi.logout();
    window.location.href = "/login/";
}

async function inicializar() {
    const usuario = await SEACApi.validateSession();
    if (!usuario) {
        window.location.replace("/login/");
        return;
    }

    if (Number(usuario.tipo) !== 1) {
        window.location.replace("/organizador/");
        return;
    }

    document.getElementById("nomeUsuario").textContent = `Olá, ${usuario.nome}`;

    try {
        const res = await SEACApi.apiRequest("/eventos");
        todosEventos = res.eventos || [];
    } catch (erro) {
        todosEventos = [];
        semResultados.textContent = erro.message || "Não foi possível carregar os eventos.";
    }

    filtrarEventos();
}

document.getElementById("sair")?.addEventListener("click", sairDaConta);
document.getElementById("linkSair")?.addEventListener("click", (event) => {
    event.preventDefault();
    sairDaConta();
});

busca?.addEventListener("input", filtrarEventos);
tipo?.addEventListener("change", filtrarEventos);
ordem?.addEventListener("change", filtrarEventos);

inicializar();
