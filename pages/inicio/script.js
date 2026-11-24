const campoBusca = document.getElementById("campoBusca");
const filtroTipo = document.getElementById("filtroTipo");
const ordenacao = document.getElementById("ordenacao");
const gradeEventos = document.getElementById("gradeEventos");
const contadorEventos = document.getElementById("contadorEventos");
const semResultados = document.getElementById("semResultados");
const linkEntrar = document.getElementById("linkEntrar");
const linkCadastro = document.getElementById("linkCadastro");

let todosEventos = [];
let usuarioAtual = null;

function abrirDetalhesEvento(ev) {
    if (!usuarioAtual) {
        window.location.href = "/login/";
        return;
    }
    const base = Number(usuarioAtual.tipo) === 0 ? "/organizador" : "/participante";
    window.location.href = `${base}/detalhes.html?id=${encodeURIComponent(ev.eventoId)}`;
}

function atualizarEventos() {
    const termo = campoBusca.value.trim().toLowerCase();
    const tipo = filtroTipo.value;

    let filtrados = todosEventos.filter((ev) => {
        const correspondeTipo = tipo === "todos" || String(ev.tipo || "").toLowerCase() === tipo;
        const texto = `${ev.nome || ""} ${ev.organizadorNome || ""} ${ev.local || ""} ${ev.categoria || ""}`.toLowerCase();
        const correspondeBusca = !termo || texto.includes(termo);
        return correspondeTipo && correspondeBusca;
    });

    filtrados.sort((a, b) => {
        const dataA = new Date(a.data);
        const dataB = new Date(b.data);
        return ordenacao.value === "desc" ? dataB - dataA : dataA - dataB;
    });

    SEACApi.renderizarCardsEventos(gradeEventos, filtrados, abrirDetalhesEvento);
    contadorEventos.textContent = `${filtrados.length} ${filtrados.length === 1 ? "Evento encontrado" : "Eventos encontrados"}`;
    semResultados.style.display = filtrados.length === 0 ? "block" : "none";
}

async function inicializar() {
    usuarioAtual = await SEACApi.validateSession();
    if (usuarioAtual && linkEntrar && linkCadastro) {
        const destino = Number(usuarioAtual.tipo) === 0 ? "/organizador/" : "/participante/";
        linkEntrar.textContent = `Olá, ${usuarioAtual.nome}`;
        linkEntrar.href = destino;
        linkCadastro.textContent = "Minha área";
        linkCadastro.href = destino;
    }

    try {
        const res = await SEACApi.apiRequest("/eventos");
        todosEventos = res.eventos || [];
    } catch (erro) {
        todosEventos = [];
        semResultados.textContent = erro.message || "Não foi possível carregar os eventos.";
    }

    atualizarEventos();
}

campoBusca.addEventListener("input", atualizarEventos);
filtroTipo.addEventListener("change", atualizarEventos);
ordenacao.addEventListener("change", atualizarEventos);

inicializar();
