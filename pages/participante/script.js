const sessao = sessionStorage.getItem("seacUsuarioLogado");
if (!sessao) {
    window.location.replace("../login/");
} else {
    const usuario = JSON.parse(sessao);
    if (usuario.tipo !== "participante") {
        window.location.replace(usuario.tipo === "organizador" ? "../organizador/" : "../participante/");
    } else {
        document.getElementById("nomeUsuario").textContent = `Olá, ${usuario.nome}`;
    }
}

function sairDaConta() {
    sessionStorage.removeItem("seacUsuarioLogado");
    window.location.href = "../login/";
}
document.getElementById("sair").addEventListener("click", sairDaConta);
document.getElementById("linkSair")?.addEventListener("click", function(event) { event.preventDefault(); sairDaConta(); });

document.querySelectorAll('.evento-card').forEach(card => {
  const abrir = () => { window.location.href = `detalhes.html?id=${encodeURIComponent(card.dataset.eventoId || 'evento-seac-01')}`; };
  card.addEventListener('click', abrir);
  card.addEventListener('keydown', event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); abrir(); } });
});

const busca = document.getElementById("campoBusca");
const tipo = document.getElementById("filtroTipo");
const ordem = document.getElementById("ordenacao");
const grade = document.getElementById("gradeEventos");
function filtrarEventos() {
  const termo = (busca?.value || "").toLocaleLowerCase("pt-BR");
  const selecionado = tipo?.value || "todos";
  let cards = Array.from(grade.querySelectorAll(".evento-card"));
  cards.forEach(card => {
    const texto = card.textContent.toLocaleLowerCase("pt-BR");
    const correspondeTipo = selecionado === "todos" || texto.includes(selecionado);
    card.style.display = texto.includes(termo) && correspondeTipo ? "" : "none";
  });
  const visiveis = cards.filter(card => card.style.display !== "none").length;
  document.getElementById("contadorEventos").textContent = `${visiveis} Eventos encontrados`;
  document.getElementById("semResultados").style.display = visiveis ? "none" : "block";
}
busca?.addEventListener("input", filtrarEventos);
tipo?.addEventListener("change", filtrarEventos);
ordem?.addEventListener("change", () => {
 const cards = Array.from(grade.querySelectorAll(".evento-card"));
 if (ordem.value === "desc") cards.reverse();
 cards.forEach(card => grade.appendChild(card));
});
