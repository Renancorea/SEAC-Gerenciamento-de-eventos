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
    categoria: "Cultural"
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
    categoria: "saude e cultura"
    }
];

export function cadastrarEvento(dados) {
    const {
        id,
        nome,
        local,
        data,
        horario,
        descricao,
        tipo,
        assentos,
        categoria
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
    const evento = {
        id: eventos.length + 1,
        nome,
        local,
        data,
        horario,
        descricao: descricao || "",
        tipo: tipo || "",
        assentos,
        categoria: categoria || ""
    };

    eventos.push(evento);
}
export function listarEvento() {
    return eventos.map(evento => ({
        nome: evento.nome,
        data: evento.data,
        horario: evento.horario,
    }));
}

export function listarDetalhesEvento(id) {
    const evento = eventos.find(evento => evento.id === id);
    if (!evento) {
        throw new Error("Evento não encontrado");
    }
    return evento;
}

export function deletarEvento(id) {
    const index = eventos.findIndex(evento => evento.id === id);
    if (index === -1) {
        throw new Error("Evento não encontrado");
    }
    eventos.splice(index, 1);
}
// findIndex retorna o index, se não acahr ele da  -1

export function editarEvento(id, dados) {
    const index = eventos.findIndex(evento => evento.id === id);
    if (index === -1) {
        throw new Error("Evento não encontrado");
    }
    eventos[index] = {
        id: dados.id,
        nome: dados.nome,
        local: dados.local,
        data: dados.data,
        horario: dados.horario,
        descricao: dados.descricao || "",
        tipo: dados.tipo || "",
        assentos: dados.assentos,
        categoria: dados.categoria || ""
    };
}