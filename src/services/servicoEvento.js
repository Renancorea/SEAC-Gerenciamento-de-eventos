import fs from "fs";
import path from "path";
import { executar } from "../db/conexao.js";

async function enriquecerEventos(listaEventos) {
    if (!listaEventos || listaEventos.length === 0) return [];

    const [usuarios, inscricoes, imagens] = await Promise.all([
        executar("SELECT usuarioId, nome FROM Usuario"),
        executar("SELECT eventoId, usuarioId, presente FROM Inscricao"),
        executar("SELECT * FROM EventoImagem")
    ]);

    const mapaOrganizadores = new Map();
    for (const u of usuarios) {
        mapaOrganizadores.set(Number(u.usuarioId), u.nome);
    }

    const contagemInscritos = new Map();
    for (const i of inscricoes) {
        const eid = Number(i.eventoId);
        contagemInscritos.set(eid, (contagemInscritos.get(eid) || 0) + 1);
    }

    const mapaImagens = new Map();
    for (const img of imagens) {
        mapaImagens.set(Number(img.eventoId), img.caminho);
    }

    return listaEventos.map(ev => {
        const eid = Number(ev.eventoId);
        const totalInscritos = contagemInscritos.get(eid) || 0;
        const assentos = Number(ev.assentos) || 0;
        return {
            ...ev,
            organizadorNome: mapaOrganizadores.get(Number(ev.idOrganizador)) || "Organizador IFCE",
            quantidadeInscritos: totalInscritos,
            assentosDisponiveis: Math.max(0, assentos - totalInscritos),
            imagem: mapaImagens.get(eid) || null
        };
    });
}

export async function cadastrarEvento(dados) {
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

    if (!nome || !local || !data || !horario || assentos == null || !idOrganizador) {
        throw new Error("Todos os campos obrigatórios (nome, local, data, horário, assentos, organizador) devem ser preenchidos.");
    }

    const assentosNum = Number(assentos);
    if (!Number.isInteger(assentosNum) || assentosNum <= 0) {
        throw new Error("A quantidade de assentos deve ser um número natural maior que zero.");
    }

    let cargaNum = 0;
    if (cargaHoraria != null && cargaHoraria !== "") {
        cargaNum = Number(cargaHoraria);
        if (isNaN(cargaNum) || cargaNum <= 0) {
            throw new Error("A carga horária deve ser um valor numérico positivo.");
        }
    }

    const organizadorResultado = await executar(
        "SELECT usuarioId, nome, tipo FROM Usuario WHERE usuarioId = ?",
        [Number(idOrganizador)]
    );

    if (organizadorResultado.length === 0) {
        throw new Error("Organizador não encontrado no sistema.");
    }

    const organizador = organizadorResultado[0];
    if (Number(organizador.tipo) !== 0) {
        throw new Error("O usuário informado não possui perfil de organizador (tipo = 0).");
    }

    const resultadoInsert = await executar(
        `INSERT INTO Evento
        (nome, local, data, horario, descricao, tipo, assentos, categoria, idOrganizador, cargaHoraria)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            nome.trim(),
            local.trim(),
            data,
            horario,
            descricao ? String(descricao).trim() : null,
            tipo || null,
            assentosNum,
            categoria ? String(categoria).trim() : null,
            Number(idOrganizador),
            cargaNum
        ]
    );

    return {
        eventoId: resultadoInsert.insertId,
        nome: nome.trim(),
        local: local.trim(),
        data,
        horario,
        descricao: descricao ? String(descricao).trim() : null,
        tipo: tipo || null,
        assentos: assentosNum,
        categoria: categoria ? String(categoria).trim() : null,
        idOrganizador: Number(idOrganizador),
        organizadorNome: organizador.nome,
        cargaHoraria: cargaNum,
        quantidadeInscritos: 0,
        assentosDisponiveis: assentosNum,
        imagem: null
    };
}

export async function listarEventos() {
    const resultado = await executar(
        `SELECT * FROM Evento ORDER BY data ASC`
    );

    return await enriquecerEventos(resultado);
}

export async function listarDetalhesEvento(idEvento) {
    if (!idEvento) {
        throw new Error("Identificador do evento não informado.");
    }

    const eventoResultado = await executar(
        `SELECT * FROM Evento WHERE eventoId = ?`,
        [Number(idEvento)]
    );

    if (eventoResultado.length === 0) {
        throw new Error("Evento não encontrado.");
    }

    const [eventoEnriquecido] = await enriquecerEventos(eventoResultado);

    const [organizadorResultado, acoesResultado, imagensResultado] = await Promise.all([
        executar(
            `SELECT usuarioId, nome, email, siape FROM Usuario WHERE usuarioId = ?`,
            [eventoEnriquecido.idOrganizador]
        ),
        executar(
            `SELECT * FROM Acao WHERE eventoId = ?`,
            [Number(idEvento)]
        ),
        executar(
            `SELECT * FROM EventoImagem WHERE eventoId = ?`,
            [Number(idEvento)]
        )
    ]);

    return {
        evento: eventoEnriquecido,
        organizador: organizadorResultado[0] || null,
        acoes: acoesResultado || [],
        imagens: imagensResultado || []
    };
}

export async function deletarEvento(idEvento, idOrganizador, isAdmin = false) {
    if (!idEvento || !idOrganizador) {
        throw new Error("Identificador do evento e do organizador são obrigatórios.");
    }

    const eventoResultado = await executar(
        `SELECT * FROM Evento WHERE eventoId = ?`,
        [Number(idEvento)]
    );

    if (eventoResultado.length === 0) {
        throw new Error("Evento não encontrado.");
    }

    const evento = eventoResultado[0];

    if (!isAdmin && Number(evento.idOrganizador) !== Number(idOrganizador)) {
        throw new Error("Acesso não autorizado: você não é o organizador responsável por este evento.");
    }

    const certificadosVinculados = await executar(
        `SELECT certificadoId FROM Certificado WHERE eventoId = ?`,
        [Number(idEvento)]
    );

    if (certificadosVinculados.length > 0) {
        throw new Error("Não é possível excluir este evento pois já existem certificados emitidos para ele.");
    }

    if (isAdmin) {
        await executar(
            `DELETE FROM Evento WHERE eventoId = ?`,
            [Number(idEvento)]
        );
    } else {
        await executar(
            `DELETE FROM Evento WHERE eventoId = ? AND idOrganizador = ?`,
            [Number(idEvento), Number(idOrganizador)]
        );
    }

    return { mensagem: "Evento excluído com sucesso." };
}

export async function editarEvento(idEvento, idOrganizador, dados, isAdmin = false) {
    if (!idEvento || !idOrganizador) {
        throw new Error("Identificador do evento e do organizador são obrigatórios.");
    }

    const eventoResultado = await executar(
        `SELECT * FROM Evento WHERE eventoId = ?`,
        [Number(idEvento)]
    );

    if (eventoResultado.length === 0) {
        throw new Error("Evento não encontrado.");
    }

    const evento = eventoResultado[0];

    if (!isAdmin && Number(evento.idOrganizador) !== Number(idOrganizador)) {
        throw new Error("Acesso não autorizado: você não é o organizador responsável por este evento.");
    }

    const nome = dados.nome !== undefined ? String(dados.nome).trim() : evento.nome;
    const local = dados.local !== undefined ? String(dados.local).trim() : evento.local;
    const data = dados.data !== undefined ? dados.data : evento.data;
    const horario = dados.horario !== undefined ? dados.horario : evento.horario;
    const descricao = dados.descricao !== undefined ? dados.descricao : evento.descricao;
    const tipo = dados.tipo !== undefined ? dados.tipo : evento.tipo;
    const categoria = dados.categoria !== undefined ? dados.categoria : evento.categoria;

    if (!nome || !local || !data || !horario) {
        throw new Error("Nome, local, data e horário são obrigatórios.");
    }

    let assentos = evento.assentos;
    if (dados.assentos !== undefined) {
        const assentosNum = Number(dados.assentos);
        if (!Number.isInteger(assentosNum) || assentosNum <= 0) {
            throw new Error("A quantidade de assentos deve ser um número natural maior que zero.");
        }
        assentos = assentosNum;
    }

    let cargaHoraria = evento.cargaHoraria;
    if (dados.cargaHoraria !== undefined && dados.cargaHoraria !== "") {
        const cargaNum = Number(dados.cargaHoraria);
        if (isNaN(cargaNum) || cargaNum <= 0) {
            throw new Error("A carga horária deve ser um valor numérico positivo.");
        }
        cargaHoraria = cargaNum;
    }

    await executar(
        `UPDATE Evento
         SET nome = ?,
             local = ?,
             data = ?,
             horario = ?,
             descricao = ?,
             tipo = ?,
             assentos = ?,
             categoria = ?,
             cargaHoraria = ?
         WHERE eventoId = ? AND idOrganizador = ?`,
        [
            nome,
            local,
            data,
            horario,
            descricao,
            tipo,
            assentos,
            categoria,
            cargaHoraria,
            Number(idEvento),
            Number(evento.idOrganizador)
        ]
    );

    const atualizado = await executar(
        `SELECT * FROM Evento WHERE eventoId = ?`,
        [Number(idEvento)]
    );
    const [enriquecido] = await enriquecerEventos(atualizado);
    return enriquecido;
}

export async function pesquisarEventos(pesquisa) {
    if (!pesquisa || String(pesquisa).trim() === "") {
        return await listarEventos();
    }

    const termo = String(pesquisa).trim().toLowerCase();
    const todos = await listarEventos();

    return todos.filter(e =>
        (e.nome && e.nome.toLowerCase().includes(termo)) ||
        (e.local && e.local.toLowerCase().includes(termo)) ||
        (e.descricao && e.descricao.toLowerCase().includes(termo)) ||
        (e.categoria && e.categoria.toLowerCase().includes(termo)) ||
        (e.organizadorNome && e.organizadorNome.toLowerCase().includes(termo))
    );
}

export async function filtrarEventos(filtros = {}) {
    const {
        tipo,
        data,
        categoria,
        cargaHoraria,
        pesquisa
    } = filtros;

    const condicoes = [];
    const parametros = [];

    if (tipo && tipo !== "todos") {
        condicoes.push("tipo = ?");
        parametros.push(tipo);
    }

    if (data) {
        condicoes.push("data = ?");
        parametros.push(data);
    }

    if (categoria && categoria !== "todas") {
        condicoes.push("categoria = ?");
        parametros.push(categoria);
    }

    if (cargaHoraria) {
        condicoes.push("cargaHoraria = ?");
        parametros.push(Number(cargaHoraria));
    }

    let resultado;
    if (condicoes.length === 0) {
        resultado = await listarEventos();
    } else {
        const sql = `SELECT * FROM Evento WHERE ${condicoes.join(" AND ")} ORDER BY data ASC`;
        const brutos = await executar(sql, parametros);
        resultado = await enriquecerEventos(brutos);
    }

    if (pesquisa && String(pesquisa).trim() !== "") {
        const termo = String(pesquisa).trim().toLowerCase();
        resultado = resultado.filter(e =>
            (e.nome && e.nome.toLowerCase().includes(termo)) ||
            (e.local && e.local.toLowerCase().includes(termo)) ||
            (e.descricao && e.descricao.toLowerCase().includes(termo)) ||
            (e.categoria && e.categoria.toLowerCase().includes(termo)) ||
            (e.organizadorNome && e.organizadorNome.toLowerCase().includes(termo))
        );
    }

    return resultado;
}

export async function salvarImagemEvento(idEvento, idOrganizador, dados, isAdmin = false) {
    const eid = Number(idEvento);
    if (!eid) {
        throw new Error("Identificador do evento não informado.");
    }

    const eventoResultado = await executar(
        `SELECT * FROM Evento WHERE eventoId = ?`,
        [eid]
    );
    if (eventoResultado.length === 0) {
        throw new Error("Evento não encontrado.");
    }

    const evento = eventoResultado[0];
    if (!isAdmin && Number(evento.idOrganizador) !== Number(idOrganizador)) {
        throw new Error("Acesso não autorizado: você não é o organizador responsável por este evento.");
    }

    const { nomeImagem, imagemBase64 } = dados || {};
    if (!imagemBase64 || typeof imagemBase64 !== "string") {
        throw new Error("Arquivo de imagem não enviado.");
    }

    const match = imagemBase64.match(/^data:image\/(png|jpeg|jpg|webp);base64,(.+)$/i);
    if (!match) {
        throw new Error("Formato de imagem inválido. Envie PNG, JPG ou WEBP.");
    }

    const extensao = match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
    const buffer = Buffer.from(match[2], "base64");

    if (buffer.length > 3 * 1024 * 1024) {
        throw new Error("A imagem deve ter no máximo 3 MB.");
    }

    const pastaUploads = path.resolve("./uploads/eventos");
    if (!fs.existsSync(pastaUploads)) {
        fs.mkdirSync(pastaUploads, { recursive: true });
    }

    const nomeSeguro = `evento-${eid}-${Date.now()}.${extensao}`;
    const caminhoDisco = path.join(pastaUploads, nomeSeguro);
    fs.writeFileSync(caminhoDisco, buffer);

    const caminhoPublico = `/uploads/eventos/${nomeSeguro}`;
    const nomeOriginal = nomeImagem ? String(nomeImagem).trim().slice(0, 200) : nomeSeguro;

    const insertRes = await executar(
        `INSERT INTO EventoImagem (nomeImagem, caminho, eventoId) VALUES (?, ?, ?)`,
        [nomeOriginal, caminhoPublico, eid]
    );

    return {
        imagemId: insertRes.insertId,
        nomeImagem: nomeOriginal,
        caminho: caminhoPublico,
        eventoId: eid
    };
}

export async function listarImagensEvento(idEvento) {
    const eid = Number(idEvento);
    if (!eid) {
        throw new Error("Identificador do evento não informado.");
    }
    return await executar(
        `SELECT * FROM EventoImagem WHERE eventoId = ?`,
        [eid]
    );
}