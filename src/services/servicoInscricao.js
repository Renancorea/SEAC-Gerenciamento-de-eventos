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

export function inscrever(idUsuario, idEvento) {

    const existe = participacoes.find(
        participacao =>
            participacao.usuarioId === idUsuario &&
            participacao.eventoId === idEvento
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


export function registrarPresenca(idUsuario, idEvento) {

    const participacao = participacoes.find(
        participacao =>
            participacao.usuarioId === idUsuario &&
            participacao.eventoId === idEvento
    );

    if (!participacao) {
        throw new Error(
            "Usuário não está inscrito neste evento"
        );
    }

    participacao.presente = true;

    return participacao;
}

// REVISAr esse negocio
export function listarInscritos(idEvento, assentos) {

    const inscritos = participacoes.filter(
        participacao =>
            participacao.eventoId === idEvento &&
            participacao.inscrito === true
    );

    return {
        inscritos: inscritos.length,
        assentosDisponiveis: assentos - inscritos.length,
        inscritos: participacoes
    };
}


export function listarPresentes(idEvento) {

    const presentes = participacoes.filter(
        participacao =>
            participacao.eventoId === idEvento &&
            participacao.presente === true
    );

    return {
        quantidadePresentes: presentes.length,
        presentes
    };
}

export function verificarInscricao(idUsuario, idEvento) {

    const participacao = participacoes.find(
        participacao =>
            participacao.usuarioId === idUsuario &&
            participacao.eventoId === idEvento
    );

    if (!participacao) {
        return {
            inscrito: false,
            presente: false
        };
    }

    return {
        inscrito: participacao.inscrito,
        presente: participacao.presente
    };
}