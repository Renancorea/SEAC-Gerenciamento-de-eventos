import mysql from "mysql2";
import bcrypt from "bcryptjs";

// Configurações da conexão MySQL
const configConexao = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "renan",
    password: process.env.DB_PASSWORD || "Renan@1234",
    database: process.env.DB_NAME || "seac",
    connectTimeout: 2000
};

// Armazenamento em memória para execução contínua caso o MySQL externo esteja indisponível
let usarBancoEmMemoria = false;

const usuarios = [
    {
        usuarioId: 1,
        nome: "Prof. Coordenador",
        email: "organizador@ifce.edu.br",
        matricula: null,
        tipo: 0, // 0 = Organizador
        siape: "123456",
        senha: bcrypt.hashSync("123456", 10),
        adm: 1
    },
    {
        usuarioId: 2,
        nome: "Aluno IFCE",
        email: "aluno@ifce.edu.br",
        matricula: "2026001",
        tipo: 1, // 1 = Participante
        siape: null,
        senha: bcrypt.hashSync("123456", 10),
        adm: 0
    }
];
let nextUsuarioId = 3;

const eventos = [
    {
        eventoId: 1,
        nome: "Semana de Ciência e Tecnologia",
        local: "Auditório Central",
        data: "2026-09-23",
        horario: "08:00:00",
        descricao: "Apresentações científicas, palestras e minicursos.",
        tipo: "cientifico",
        assentos: 100,
        categoria: "Tecnologia",
        idOrganizador: 1,
        cargaHoraria: 20
    },
    {
        eventoId: 2,
        nome: "Workshop de Programação Web",
        local: "Laboratório 3",
        data: "2026-09-25",
        horario: "14:00:00",
        descricao: "Minicurso prático sobre Node.js e APIs REST.",
        tipo: "academico",
        assentos: 40,
        categoria: "Informática",
        idOrganizador: 1,
        cargaHoraria: 8
    },
    {
        eventoId: 3,
        nome: "Mostra Cultural IFCE",
        local: "Pátio Principal",
        data: "2026-09-27",
        horario: "18:00:00",
        descricao: "Música, teatro e exposições artísticas dos alunos.",
        tipo: "cultural",
        assentos: 150,
        categoria: "Cultura",
        idOrganizador: 1,
        cargaHoraria: 10
    },
    {
        eventoId: 4,
        nome: "Simpósio de Pesquisa e Inovação",
        local: "Auditório Central",
        data: "2026-09-30",
        horario: "09:00:00",
        descricao: "Debates com pesquisadores e inovação acadêmica.",
        tipo: "cientifico",
        assentos: 80,
        categoria: "Pesquisa",
        idOrganizador: 1,
        cargaHoraria: 16
    }
];
let nextEventoId = 5;

const acoes = [
    { acaoId: 1, nome: "Palestra de Abertura", eventoId: 1 },
    { acaoId: 2, nome: "Apresentação de Pôsteres", eventoId: 1 }
];
let nextAcaoId = 3;

const inscricoes = [
    {
        inscricaoId: 1,
        usuarioId: 2,
        eventoId: 1,
        presente: true,
        dataInscricao: new Date()
    }
];
let nextInscricaoId = 2;

const certificados = [];
let nextCertificadoId = 1;

const eventoImagens = [];
let nextImagemId = 1;

function toBoolean(val) {
    return val === true || val === 1 || val === "1" || val === "true";
}

function executarSqlEmMemoria(sql, valores = []) {
    const normalSql = sql.replace(/\s+/g, " ").trim();

    // DDL
    if (/^CREATE TABLE/i.test(normalSql)) {
        return [];
    }

    // USUARIO
    if (/SELECT .* FROM Usuario WHERE siape = \? AND tipo = 0/i.test(normalSql)) {
        const val = String(valores[0]).trim();
        return usuarios.filter(u => String(u.siape) === val && Number(u.tipo) === 0).map(u => ({ ...u }));
    }

    if (/SELECT .* FROM Usuario WHERE siape = \?/i.test(normalSql)) {
        const val = String(valores[0]).trim();
        return usuarios.filter(u => String(u.siape) === val).map(u => ({ ...u }));
    }

    if (/SELECT .* FROM Usuario WHERE matricula = \? AND tipo = 1/i.test(normalSql)) {
        const val = String(valores[0]).trim();
        return usuarios.filter(u => String(u.matricula) === val && Number(u.tipo) === 1).map(u => ({ ...u }));
    }

    if (/SELECT .* FROM Usuario WHERE matricula = \?/i.test(normalSql)) {
        const val = String(valores[0]).trim();
        return usuarios.filter(u => String(u.matricula) === val).map(u => ({ ...u }));
    }

    if (/SELECT .* FROM Usuario WHERE email = \?/i.test(normalSql)) {
        const val = String(valores[0]).trim().toLowerCase();
        return usuarios.filter(u => u.email && u.email.toLowerCase() === val).map(u => ({ ...u }));
    }

    if (/SELECT .* FROM Usuario WHERE usuarioId = \?/i.test(normalSql)) {
        const val = Number(valores[0]);
        return usuarios.filter(u => u.usuarioId === val).map(u => ({ ...u }));
    }

    if (/SELECT .* FROM Usuario/i.test(normalSql) && !/WHERE/i.test(normalSql) && !/JOIN/i.test(normalSql)) {
        return usuarios
            .map(u => ({ ...u }))
            .sort((a, b) => a.nome.localeCompare(b.nome));
    }

    if (/INSERT INTO Usuario/i.test(normalSql)) {
        const [nome, matricula, email, tipo, siape, senha, adm] = valores;
        const novo = {
            usuarioId: nextUsuarioId++,
            nome,
            matricula: matricula || null,
            email,
            tipo: Number(tipo),
            siape: siape || null,
            senha,
            adm: adm ? 1 : 0
        };
        usuarios.push(novo);
        return { insertId: novo.usuarioId, affectedRows: 1 };
    }

    // EVENTO IMAGEM
    if (/SELECT .* FROM EventoImagem WHERE eventoId = \?/i.test(normalSql)) {
        const eid = Number(valores[0]);
        return eventoImagens
            .filter(img => img.eventoId === eid)
            .map(img => ({ ...img }));
    }

    if (/SELECT .* FROM EventoImagem WHERE imagemId = \?/i.test(normalSql)) {
        const iid = Number(valores[0]);
        return eventoImagens
            .filter(img => img.imagemId === iid)
            .map(img => ({ ...img }));
    }

    if (/SELECT .* FROM EventoImagem/i.test(normalSql) && !/WHERE/i.test(normalSql)) {
        return eventoImagens.map(img => ({ ...img }));
    }

    if (/INSERT INTO EventoImagem/i.test(normalSql)) {
        const [nomeImagem, caminho, eventoId] = valores;
        const nova = {
            imagemId: nextImagemId++,
            nomeImagem,
            caminho,
            dataEnvio: new Date(),
            eventoId: Number(eventoId)
        };
        eventoImagens.push(nova);
        return { insertId: nova.imagemId, affectedRows: 1 };
    }

    if (/DELETE FROM EventoImagem WHERE imagemId = \?/i.test(normalSql)) {
        const iid = Number(valores[0]);
        const idx = eventoImagens.findIndex(img => img.imagemId === iid);
        if (idx !== -1) {
            eventoImagens.splice(idx, 1);
            return { affectedRows: 1 };
        }
        return { affectedRows: 0 };
    }

    // EVENTO
    if (/SELECT .* FROM Evento WHERE eventoId = \?/i.test(normalSql)) {
        const val = Number(valores[0]);
        return eventos.filter(e => e.eventoId === val).map(e => ({ ...e }));
    }

    if (/SELECT .* FROM Evento WHERE idOrganizador = \?/i.test(normalSql)) {
        const val = Number(valores[0]);
        return eventos
            .filter(e => e.idOrganizador === val)
            .map(e => ({ ...e }))
            .sort((a, b) => String(a.data).localeCompare(String(b.data)));
    }

    if (/SELECT .* FROM Evento WHERE LOWER\(nome\) LIKE \?/i.test(normalSql)) {
        const termo = String(valores[0] || "").replace(/%/g, "").toLowerCase();
        return eventos
            .filter(e =>
                (e.nome && e.nome.toLowerCase().includes(termo)) ||
                (e.local && e.local.toLowerCase().includes(termo)) ||
                (e.descricao && e.descricao.toLowerCase().includes(termo))
            )
            .map(e => ({ ...e }))
            .sort((a, b) => String(a.data).localeCompare(String(b.data)));
    }

    if (/SELECT .* FROM Evento WHERE/i.test(normalSql)) {
        let resultado = eventos.map(e => ({ ...e }));
        let paramIdx = 0;
        if (normalSql.includes("tipo = ?")) {
            const v = valores[paramIdx++];
            resultado = resultado.filter(e => e.tipo === v);
        }
        if (normalSql.includes("data = ?")) {
            const v = valores[paramIdx++];
            resultado = resultado.filter(e => e.data === v);
        }
        if (normalSql.includes("categoria = ?")) {
            const v = valores[paramIdx++];
            resultado = resultado.filter(e => e.categoria === v);
        }
        if (normalSql.includes("cargaHoraria = ?")) {
            const v = valores[paramIdx++];
            resultado = resultado.filter(e => Number(e.cargaHoraria) === Number(v));
        }
        return resultado.sort((a, b) => String(a.data).localeCompare(String(b.data)));
    }

    if (/SELECT .* FROM Evento/i.test(normalSql) && !/WHERE/i.test(normalSql) && !/JOIN/i.test(normalSql)) {
        return eventos
            .map(e => ({ ...e }))
            .sort((a, b) => String(a.data).localeCompare(String(b.data)));
    }

    if (/INSERT INTO Evento /i.test(normalSql) || /INSERT INTO Evento\(/i.test(normalSql)) {
        const [nome, local, data, horario, descricao, tipo, assentos, categoria, idOrganizador, cargaHoraria] = valores;
        const novo = {
            eventoId: nextEventoId++,
            nome,
            local,
            data,
            horario,
            descricao,
            tipo,
            assentos: Number(assentos),
            categoria,
            idOrganizador: Number(idOrganizador),
            cargaHoraria: Number(cargaHoraria)
        };
        eventos.push(novo);
        return { insertId: novo.eventoId, affectedRows: 1 };
    }

    if (/UPDATE Evento SET/i.test(normalSql)) {
        const [nome, local, data, horario, descricao, tipo, assentos, categoria, cargaHoraria, idEvento] = valores;
        const hasOrg = normalSql.includes("idOrganizador = ?");
        const idOrganizador = hasOrg ? valores[10] : null;
        const idx = eventos.findIndex(e =>
            e.eventoId === Number(idEvento) &&
            (!hasOrg || e.idOrganizador === Number(idOrganizador))
        );
        if (idx !== -1) {
            eventos[idx] = {
                ...eventos[idx],
                nome, local, data, horario, descricao, tipo,
                assentos: Number(assentos),
                categoria,
                cargaHoraria: Number(cargaHoraria)
            };
            return { affectedRows: 1 };
        }
        return { affectedRows: 0 };
    }

    if (/DELETE FROM Evento WHERE eventoId = \? AND idOrganizador = \?/i.test(normalSql)) {
        const [id, idOrg] = valores;
        const eid = Number(id);
        if (certificados.some(c => c.eventoId === eid)) {
            throw new Error("Não é possível excluir um evento que já possui certificados emitidos.");
        }
        const idx = eventos.findIndex(e => e.eventoId === eid && e.idOrganizador === Number(idOrg));
        if (idx !== -1) {
            eventos.splice(idx, 1);
            for (let i = acoes.length - 1; i >= 0; i--) {
                if (acoes[i].eventoId === eid) acoes.splice(i, 1);
            }
            for (let i = inscricoes.length - 1; i >= 0; i--) {
                if (inscricoes[i].eventoId === eid) inscricoes.splice(i, 1);
            }
            for (let i = eventoImagens.length - 1; i >= 0; i--) {
                if (eventoImagens[i].eventoId === eid) eventoImagens.splice(i, 1);
            }
            return { affectedRows: 1 };
        }
        return { affectedRows: 0 };
    }

    if (/DELETE FROM Evento WHERE eventoId = \?/i.test(normalSql)) {
        const eid = Number(valores[0]);
        if (certificados.some(c => c.eventoId === eid)) {
            throw new Error("Não é possível excluir um evento que já possui certificados emitidos.");
        }
        const idx = eventos.findIndex(e => e.eventoId === eid);
        if (idx !== -1) {
            eventos.splice(idx, 1);
            for (let i = acoes.length - 1; i >= 0; i--) {
                if (acoes[i].eventoId === eid) acoes.splice(i, 1);
            }
            for (let i = inscricoes.length - 1; i >= 0; i--) {
                if (inscricoes[i].eventoId === eid) inscricoes.splice(i, 1);
            }
            for (let i = eventoImagens.length - 1; i >= 0; i--) {
                if (eventoImagens[i].eventoId === eid) eventoImagens.splice(i, 1);
            }
            return { affectedRows: 1 };
        }
        return { affectedRows: 0 };
    }

    // ACAO
    if (/SELECT \* FROM Acao WHERE acaoId = \?/i.test(normalSql)) {
        const val = Number(valores[0]);
        return acoes.filter(a => a.acaoId === val).map(a => ({ ...a }));
    }

    if (/SELECT \* FROM Acao WHERE eventoId = \?/i.test(normalSql)) {
        const val = Number(valores[0]);
        return acoes.filter(a => a.eventoId === val).map(a => ({ ...a }));
    }

    if (/INSERT INTO Acao/i.test(normalSql)) {
        const [nome, eventoId] = valores;
        const novo = { acaoId: nextAcaoId++, nome, eventoId: Number(eventoId) };
        acoes.push(novo);
        return { insertId: novo.acaoId, affectedRows: 1 };
    }

    if (/UPDATE Acao SET nome = \? WHERE acaoId = \?/i.test(normalSql)) {
        const [nome, acaoId] = valores;
        const a = acoes.find(x => x.acaoId === Number(acaoId));
        if (a) {
            a.nome = nome;
            return { affectedRows: 1 };
        }
        return { affectedRows: 0 };
    }

    if (/DELETE FROM Acao WHERE acaoId = \?/i.test(normalSql)) {
        const acaoId = Number(valores[0]);
        const idx = acoes.findIndex(a => a.acaoId === acaoId);
        if (idx !== -1) {
            acoes.splice(idx, 1);
            return { affectedRows: 1 };
        }
        return { affectedRows: 0 };
    }

    // INSCRICAO
    if (/SELECT \* FROM Inscricao WHERE usuarioId = \? AND eventoId = \?/i.test(normalSql)) {
        const [uid, eid] = valores.map(Number);
        return inscricoes.filter(i => i.usuarioId === uid && i.eventoId === eid).map(i => ({ ...i }));
    }

    if (/SELECT \* FROM Inscricao WHERE usuarioId = \?/i.test(normalSql)) {
        const uid = Number(valores[0]);
        return inscricoes.filter(i => i.usuarioId === uid).map(i => ({ ...i }));
    }

    if (/SELECT .* FROM (Inscricao .* Usuario|Usuario .* Inscricao) .* WHERE i\.eventoId = \? AND i\.presente = \?/i.test(normalSql)) {
        const [eid, pres] = valores;
        const isPres = toBoolean(pres);
        return inscricoes
            .filter(i => i.eventoId === Number(eid) && Boolean(i.presente) === isPres)
            .map(i => {
                const u = usuarios.find(user => user.usuarioId === i.usuarioId);
                return {
                    inscricaoId: i.inscricaoId,
                    usuarioId: i.usuarioId,
                    eventoId: i.eventoId,
                    presente: i.presente,
                    dataInscricao: i.dataInscricao,
                    nome: u?.nome || "",
                    matricula: u?.matricula || null,
                    siape: u?.siape || null,
                    email: u?.email || ""
                };
            });
    }

    if (/SELECT .* FROM (Inscricao .* Usuario|Usuario .* Inscricao) .* WHERE i\.eventoId = \?/i.test(normalSql)) {
        const [eid] = valores;
        return inscricoes
            .filter(i => i.eventoId === Number(eid))
            .map(i => {
                const u = usuarios.find(user => user.usuarioId === i.usuarioId);
                return {
                    inscricaoId: i.inscricaoId,
                    usuarioId: i.usuarioId,
                    eventoId: i.eventoId,
                    presente: i.presente,
                    dataInscricao: i.dataInscricao,
                    nome: u?.nome || "",
                    matricula: u?.matricula || null,
                    siape: u?.siape || null,
                    email: u?.email || ""
                };
            });
    }

    if (/SELECT .* FROM Inscricao .* Evento .* WHERE i\.usuarioId = \?/i.test(normalSql)) {
        const uid = Number(valores[0]);
        return inscricoes
            .filter(i => i.usuarioId === uid)
            .map(i => {
                const e = eventos.find(ev => ev.eventoId === i.eventoId);
                return {
                    inscricaoId: i.inscricaoId,
                    usuarioId: i.usuarioId,
                    eventoId: i.eventoId,
                    presente: Boolean(i.presente),
                    dataInscricao: i.dataInscricao,
                    nomeEvento: e?.nome || "",
                    dataEvento: e?.data || "",
                    horarioEvento: e?.horario || "",
                    localEvento: e?.local || "",
                    cargaHoraria: e?.cargaHoraria || 0
                };
            });
    }

    if (/SELECT \* FROM Inscricao WHERE eventoId = \? AND presente = \?/i.test(normalSql)) {
        const [eid, pres] = valores;
        const isPres = toBoolean(pres);
        return inscricoes.filter(i => i.eventoId === Number(eid) && Boolean(i.presente) === isPres).map(i => ({ ...i }));
    }

    if (/SELECT .* FROM Inscricao WHERE eventoId = \?/i.test(normalSql)) {
        const [eid] = valores;
        return inscricoes.filter(i => i.eventoId === Number(eid)).map(i => ({ ...i }));
    }

    if (/SELECT .* FROM Inscricao/i.test(normalSql) && !/WHERE/i.test(normalSql) && !/JOIN/i.test(normalSql)) {
        return inscricoes.map(i => ({ ...i }));
    }

    if (/INSERT INTO Inscricao/i.test(normalSql)) {
        const [uid, eid, pres] = valores;
        const nova = {
            inscricaoId: nextInscricaoId++,
            usuarioId: Number(uid),
            eventoId: Number(eid),
            presente: toBoolean(pres),
            dataInscricao: new Date()
        };
        inscricoes.push(nova);
        return { insertId: nova.inscricaoId, affectedRows: 1 };
    }

    if (/UPDATE Inscricao SET presente = \? WHERE usuarioId = \? AND eventoId = \?/i.test(normalSql)) {
        const [pres, uid, eid] = valores;
        const item = inscricoes.find(x => x.usuarioId === Number(uid) && x.eventoId === Number(eid));
        if (item) {
            item.presente = toBoolean(pres);
            return { affectedRows: 1 };
        }
        return { affectedRows: 0 };
    }

    // CERTIFICADO
    if (/SELECT .* FROM Usuario .* Inscricao .* Evento .* WHERE u\.usuarioId = \? AND e\.eventoId = \?/i.test(normalSql)) {
        const [uid, eid] = valores.map(Number);
        const ins = inscricoes.find(i => i.usuarioId === uid && i.eventoId === eid);
        if (!ins) return [];
        const u = usuarios.find(user => user.usuarioId === uid);
        const e = eventos.find(event => event.eventoId === eid);
        if (!u || !e) return [];
        return [{
            usuarioId: u.usuarioId,
            nomeParticipante: u.nome,
            matricula: u.matricula,
            siape: u.siape,
            eventoId: e.eventoId,
            nomeEvento: e.nome,
            dataEvento: e.data,
            cargaHoraria: e.cargaHoraria,
            presente: ins.presente ? 1 : 0
        }];
    }

    if (/SELECT .* FROM Certificado .* Evento .* WHERE c\.usuarioId = \?/i.test(normalSql)) {
        const uid = Number(valores[0]);
        return certificados
            .filter(c => c.usuarioId === uid)
            .map(c => {
                const e = eventos.find(ev => ev.eventoId === c.eventoId);
                return {
                    ...c,
                    nomeEvento: e?.nome || "Evento",
                    dataEvento: e?.data || null,
                    localEvento: e?.local || ""
                };
            });
    }

    if (/SELECT \* FROM Certificado WHERE usuarioId = \? AND eventoId = \?/i.test(normalSql)) {
        const [uid, eid] = valores.map(Number);
        return certificados.filter(c => c.usuarioId === uid && c.eventoId === eid).map(c => ({ ...c }));
    }

    if (/SELECT \* FROM Certificado WHERE usuarioId = \?/i.test(normalSql)) {
        const uid = Number(valores[0]);
        return certificados.filter(c => c.usuarioId === uid).map(c => ({ ...c }));
    }

    if (/SELECT \* FROM Certificado WHERE certificadoId = \?/i.test(normalSql)) {
        const cid = Number(valores[0]);
        return certificados.filter(c => c.certificadoId === cid).map(c => ({ ...c }));
    }

    if (/SELECT \* FROM Certificado WHERE eventoId = \?/i.test(normalSql)) {
        const eid = Number(valores[0]);
        return certificados.filter(c => c.eventoId === eid).map(c => ({ ...c }));
    }

    if (/INSERT INTO Certificado/i.test(normalSql)) {
        const [cargaHoraria, arquivo, dataEmissao, usuarioId, eventoId] = valores;
        const novo = {
            certificadoId: nextCertificadoId++,
            cargaHoraria: Number(cargaHoraria),
            arquivo,
            dataEmissao: dataEmissao || new Date(),
            usuarioId: Number(usuarioId),
            eventoId: Number(eventoId)
        };
        certificados.push(novo);
        return { insertId: novo.certificadoId, affectedRows: 1 };
    }

    return [];
}

// Inicializa conexão MySQL com mysql2
let poolOuConexao;
try {
    poolOuConexao = mysql.createConnection(configConexao);
    poolOuConexao.on("error", (err) => {
        console.warn("[SEAC] Erro assíncrono no MySQL (" + err.message + "). Mantendo modo em memória.");
        usarBancoEmMemoria = true;
    });
} catch (err) {
    console.warn("[SEAC] Não foi possível instanciar mysql2, ativando banco em memória:", err.message);
    usarBancoEmMemoria = true;
}

const Conexao = {
    connect(callback) {
        if (!poolOuConexao || usarBancoEmMemoria) {
            usarBancoEmMemoria = true;
            console.log("[SEAC] Conexão ativa no modo em memória.");
            if (typeof callback === "function") callback(null);
            return;
        }

        poolOuConexao.connect((err) => {
            if (err) {
                console.warn("[SEAC] Servidor MySQL local não alcançado (" + err.message + "). Alternando para modo em memória.");
                usarBancoEmMemoria = true;
                if (typeof callback === "function") callback(null);
                return;
            }
            console.log("[SEAC] Conectado com sucesso ao MySQL:", configConexao.database);
            if (typeof callback === "function") callback(null);
        });
    },

    query(sql, valores, callback) {
        if (typeof valores === "function") {
            callback = valores;
            valores = [];
        }

        if (usarBancoEmMemoria) {
            try {
                const res = executarSqlEmMemoria(sql, valores);
                if (typeof callback === "function") callback(null, res);
            } catch (err) {
                if (typeof callback === "function") callback(err);
            }
            return;
        }

        poolOuConexao.query(sql, valores, (err, res) => {
            if (err) {
                console.warn("[SEAC] Erro na query MySQL, aplicando fallback em memória:", err.message);
                usarBancoEmMemoria = true;
                try {
                    const fallbackRes = executarSqlEmMemoria(sql, valores);
                    return callback(null, fallbackRes);
                } catch (fallbackErr) {
                    return callback(fallbackErr);
                }
            }
            callback(null, res);
        });
    },

    execute(sql, valores, callback) {
        if (typeof valores === "function") {
            callback = valores;
            valores = [];
        }

        if (usarBancoEmMemoria) {
            try {
                const res = executarSqlEmMemoria(sql, valores);
                if (typeof callback === "function") callback(null, res);
            } catch (err) {
                if (typeof callback === "function") callback(err);
            }
            return;
        }

        poolOuConexao.execute(sql, valores, (err, res) => {
            if (err) {
                console.warn("[SEAC] Erro no execute MySQL, aplicando fallback em memória:", err.message);
                usarBancoEmMemoria = true;
                try {
                    const fallbackRes = executarSqlEmMemoria(sql, valores);
                    return callback(null, fallbackRes);
                } catch (fallbackErr) {
                    return callback(fallbackErr);
                }
            }
            callback(null, res);
        });
    }
};

// Conectar imediatamente
Conexao.connect((err) => {
    if (err) {
        console.error("Erro ao conectar no banco de dados:", err);
    }
});

// Função auxiliar baseada em Promise conforme padrão exigido pelo projeto
export function executar(sql, valores = []) {
    return new Promise((resolve, reject) => {
        Conexao.execute(sql, valores, (erro, resultado) => {
            if (erro) {
                reject(erro);
                return;
            }
            resolve(resultado);
        });
    });
}

export default Conexao;