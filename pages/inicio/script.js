const campoBusca = document.getElementById('campoBusca');
const filtroTipo = document.getElementById('filtroTipo');
const ordenacao = document.getElementById('ordenacao');
const gradeEventos = document.getElementById('gradeEventos');
const contadorEventos = document.getElementById('contadorEventos');
const semResultados = document.getElementById('semResultados');

function atualizarEventos() {
    const termo = campoBusca.value.trim().toLowerCase();
    const tipo = filtroTipo.value;
    const cards = [...gradeEventos.querySelectorAll('.evento-card')];

    cards.sort((a, b) => {
        const dataA = new Date(a.dataset.data);
        const dataB = new Date(b.dataset.data);
        if (ordenacao.value === 'desc') return dataB - dataA;
        return dataA - dataB;
    });

    cards.forEach(card => gradeEventos.appendChild(card));

    let encontrados = 0;

    cards.forEach(card => {
        const correspondeTipo = tipo === 'todos' || card.dataset.tipo === tipo;
        const texto = card.dataset.busca.toLowerCase();
        const correspondeBusca = !termo || texto.includes(termo);
        const mostrar = correspondeTipo && correspondeBusca;

        card.style.display = mostrar ? '' : 'none';
        if (mostrar) encontrados++;
    });

    contadorEventos.textContent = `${encontrados} ${encontrados === 1 ? 'Evento encontrado' : 'Eventos encontrados'}`;
    semResultados.style.display = encontrados === 0 ? 'block' : 'none';
}

campoBusca.addEventListener('input', atualizarEventos);
filtroTipo.addEventListener('change', atualizarEventos);
ordenacao.addEventListener('change', atualizarEventos);

atualizarEventos();

const linkEntrar = document.getElementById('linkEntrar');
const linkCadastro = document.getElementById('linkCadastro');
const usuarioLogado = localStorage.getItem('seacNomeUsuario') || localStorage.getItem('seacUsuario');

if (usuarioLogado) {
    linkEntrar.textContent = `Olá, ${usuarioLogado}`;
    linkEntrar.href = '#';
    linkEntrar.addEventListener('click', function(event) {
        event.preventDefault();
    });
    linkCadastro.style.display = 'none';
}
