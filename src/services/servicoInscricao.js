const participacoes = [
    {
        id: 1,
        usuarioId: 1,
        eventoId: 2,
        inscrito: true,
        presente: false
    },
    {
        id: 2,
        usuarioId: 2,
        eventoId: 2,
        inscrito: true,
        presente: false
    },
    {
        id: 3,
        usuarioId: 3,
        eventoId: 2,
        inscrito: true,
        presente: false
    }
];

export function inscrever(usuarioId, eventoId) {

    const existe = participacoes.find(
        participacao =>
            participacao.usuarioId === usuarioId &&
            participacao.eventoId === eventoId
    );
    }

export function inscrever(usuarioId, eventoId) {

    const existe = participacoes.find(
        participacao =>
            participacao.usuarioId === usuarioId &&
            participacao.eventoId === eventoId
    );

    if (existe) {
        throw new Error(
            "Usuário já está inscrito neste evento"
        );
    }

    const participacao = {
        id: participacoes.length + 1,
        usuarioId,
        eventoId,
        inscrito: true,
        presente: false
    };

    participacoes.push(participacao);

    return participacao;
}


export function registrarPresenca(usuarioId, eventoId) {

    const participacao = participacoes.find(
        participacao =>
            participacao.usuarioId === usuarioId &&
            participacao.eventoId === eventoId
    );

    if (!participacao) {
        throw new Error(
            "Usuário não está inscrito neste evento"
        );
    }

    participacao.presente = true;

    return participacao;
}


export function listarInscritos(eventoId, quantidadeVagas) {

    const inscritos = participacoes.filter(
        participacao =>
            participacao.eventoId === eventoId &&
            participacao.inscrito === true
    );

    return {
        quantidadeInscritos: inscritos.length,
        vagasDisponiveis: quantidadeVagas - inscritos.length,
        inscritos
    };
}


export function listarPresentes(eventoId) {

    const presentes = participacoes.filter(
        participacao =>
            participacao.eventoId === eventoId &&
            participacao.presente === true
    );

    return {
        quantidadePresentes: presentes.length,
        presentes
    };
}