const eventos = [
    {
    id: 1,
    nome: "IFCE vozes",
    local: "Auditório Principal",
    data: "2026-05-15",
    horario: "13:00",
    descricao: "Musicas e talentos",
    tipo: "seinao",
    assentos: 100,
    categoria: "Cultural",
    idOrganizador: 1,
    cargaHoraria: 2
    },
    {
    id: 2,
    nome: "X(10°) evento cultural",
    local: "Auditório Principal",
    data: "2026-07-26",
    horario: "08:00",
    descricao: "Autismo e inclusão",
    tipo: "Palestra",
    assentos: 100,
    categoria: "saude e cultura",
    idOrganizador: 1,
    cargaHoraria: 2
    }
];
const usuarios = [
    {
    "nome": "Renan",
    "matricula": "2024001",
    "email": "renan@gmail.com",
    "tipo": 1,
    "senha": "123456"
},
{
    "nome": "Ana",
    "matricula": null,
    "email": "ana@gmail.com",
    "tipo": 0,
    "siape": "1234567",
    "senha": "123456"
}
];
const organizadores = [
    {
    "id": 1,
    "nome": "Ana",
    "matricula": null,
    "email": "ana@gmail.com",
    "tipo": 0,
    "siape": "1234567",
    "senha": "123456"
    }
]

export function cadastrarEvento(dados) {
    const {
        nome,
        local,
        data,
        horario,
        descricao,
        tipo,
        assentos,
        categoria,
        idOrganizador,
        cargaHoraria
    } = dados;

    // descrição opc
    // na pratica podem confundir tipo com categoria
    if (!nome || !local || !data || !horario || !assentos) {
            throw new Error(
                "Todos esses campos devem ser preenchidos"
            );
        }
    if (assentos != null && (!Number.isInteger(assentos) || assentos <= 0)) {
        throw new Error(
            "O numero de assentos deve ser um natural maior que 0"
        )
    }
    if (cargaHoraria != null && (!Number.isInteger(cargaHoraria) || cargaHoraria <= 0)) {
        throw new Error(
            "A carga horaria deve ser um natural maior que 0"
        )
    }

     const organizador = organizadores.find(
        organizador => organizador.id === idOrganizador
    );

    if (!organizador) {
        throw new Error("Organizador não encontrado");
    }

    const evento = {
        id: eventos.length + 1,
        nome,
        local,
        data,
        horario,
        descricao: descricao || "",
        tipo: tipo || "",
        assentos,
        categoria: categoria || "",
        idOrganizador,
        cargaHoraria: cargaHoraria
    };

    eventos.push(evento);
}
export function listarEventos() {
    return eventos.map(evento => ({
        nome: evento.nome,
        data: evento.data,
        horario: evento.horario,
        cargaHoraria: evento.cargaHoraria,
        nomeOrganizador: organizadores.find(a => a.id === evento.idOrganizador)?.nome || "Desconhecido"
    }));
}

export function listarDetalhesEvento(id) {
    const evento = eventos.find(evento => evento.id === id);
    if (!evento) {
        throw new Error("Evento não encontrado");
    }

      const organizador = organizadores.find(
        organizador => organizador.id === evento.idOrganizador
    );

    return{
    ...evento,
    nomeOrganizador: organizador?.nome || "Desconhecido"
    };
    // esses 3 pontos cria um novo objeto adicionando outro breguesse
}

export function deletarEvento(id, idOrganizador) {

    const index = eventos.findIndex(evento => evento.id === id);
    if (index === -1) {
        throw new Error("Evento não encontrado");
    }

    const evento = eventos[index];
    if (evento.idOrganizador !== idOrganizador) {
        throw new Error(
            "Você não pode remover este evento"
        );
    }

    eventos.splice(index, 1);
}
// findIndex retorna o index, se não acahr ele da  -1

export function editarEvento(idEvento, idOrganizador, dados) {

    const index = eventos.findIndex(evento => evento.id === idEvento);

    if (index === -1) {
        throw new Error("Evento não encontrado");
    }

    const evento = eventos[index];

    if (evento.idOrganizador !== idOrganizador) {
        throw new Error(
            "Você não pode editar este evento"
        );
    }

    eventos[index] = {
        id: idEvento,
        nome: dados.nome,
        local: dados.local,
        data: dados.data,
        horario: dados.horario,
        descricao: dados.descricao || "",
        tipo: dados.tipo || "",
        assentos: dados.assentos,
        categoria: dados.categoria || "",
        idOrganizador: evento.idOrganizador,
        cargaHoraria: dados.cargaHoraria || "",
    };
}

export function pesquisarEventos(pesquisa) {

    pesquisa = pesquisa.toLowerCase();

    const resultado = eventos.filter(evento => {

        const nomeOrganizador = usuarios.find(a => a.id === evento.idOrganizador)?.nome.toLowerCase() || "Sem";
        
        return (
            evento.nome.toLowerCase().includes(pesquisa) ||
            nomeOrganizador.includes(pesquisa)
        );
    });

    return resultado;
}

export function filtrarEventos(tipo, data, categoria, cargaHoraria) {

    let resultado = eventos;

      if (tipo) {
        resultado = resultado.filter(
            evento => evento.tipo === tipo
        );
    }

    if (categoria) {
        resultado = resultado.filter(
            evento => evento.categoria === categoria
        );
    }
    if (cargaHoraria) {
        resultado = resultado.filter(
            evento => evento.cargaHoraria === cargaHoraria
        );
    }

    resultado.sort(
        (a, b) => new Date(a.data) - new Date(b.data)
    );

    return resultado;
};