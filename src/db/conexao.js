import mysql from "mysql2";
import bcrypt from "bcryptjs";

// Configurações da conexão MySQL
const configConexao = {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "renan",
    password: process.env.DB_PASSWORD || "Renan@1234",
    database: process.env.DB_NAME || "seac"
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

function executarSqlEmMemoria(sql, valores = []) {
    const normalSql = sql.replace(/\s+/g, " ").trim();

    // DDL
    if (/^CREATE TABLE/i.test(normalSql)) {
        return [];
    }

    // USUARIO
    if (/SELECT .* FROM Usuario WHERE siape = \? AND tipo = 0/i.test(normalSql)) {
        const val = String(valores[0]).trim();
        return usuarios.filter(u => String(u.siape) === val && Number(u.tipo) === 0);
    }

    if (/SELECT .* FROM Usuario WHERE siape = \?/i.test(normalSql)) {
        const val = String(valores[0]).trim();
        return usuarios.filter(u => String(u.siape) === val);
    }

    if (/SELECT .* FROM Usuario WHERE matricula = \? AND tipo = 1/i.test(normalSql)) {
        const val = String(valores[0]).trim();
        return usuarios.filter(u => String(u.matricula) === val && Number(u.tipo) === 1);
    }

    if (/SELECT .* FROM Usuario WHERE matricula = \?/i.test(normalSql)) {
        const val = String(valores[0]).trim();
        return usuarios.filter(u => String(u.matricula) === val);
    }

    if (/SELECT .* FROM Usuario WHERE email = \?/i.test(normalSql)) {
        const val = String(valores[0]).trim().toLowerCase();
        return usuarios.filter(u => u.email && u.email.toLowerCase() === val);
    }

    if (/SELECT .* FROM Usuario WHERE usuarioId = \?/i.test(normalSql)) {
        const val = Number(valores[0]);
        return usuarios.filter(u => u.usuarioId === val);
    }

    if (/SELECT .* FROM Usuario/i.test(normalSql) && !/WHERE/i.test(normalSql)) {
        return usuarios.map(u => ({ ...u }));
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

    // EVENTO
    if (/SELECT .* FROM Evento WHERE eventoId = \?/i.test(normalSql)) {
        const val = Number(valores[0]);
        return eventos.filter(e => e.eventoId === val);
    }

    if (/SELECT .* FROM Evento WHERE LOWER\(nome\) LIKE \?/i.test(normalSql)) {
        const termo = String(valores[0] || "").replace(/%/g, "").toLowerCase();
        return eventos.filter(e =>
            (e.nome && e.nome.toLowerCase().includes(termo)) ||
            (e.local && e.local.toLowerCase().includes(termo)) ||
            (e.descricao && e.descricao.toLowerCase().includes(termo))
        );
    }

    if (/SELECT .* FROM Evento WHERE/i.test(normalSql)) {
        // Multi-field AND filter
        let resultado = [...eventos];
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
        return resultado;
    }

    if (/SELECT .* FROM Evento/i.test(normalSql) && !/WHERE/i.test(normalSql)) {
        return [...eventos];
    }

    if (/INSERT INTO Evento/i.test(normalSql)) {
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
        const [nome, local, data, horario, descricao, tipo, assentos, categoria, cargaHoraria, idEvento, idOrganizador] = valores;
        const idx = eventos.findIndex(e => e.eventoId === Number(idEvento) && e.idOrganizador === Number(idOrganizador));
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
        const idx = eventos.findIndex(e => e.eventoId === Number(id) && e.idOrganizador === Number(idOrg));
        if (idx !== -1) {
            eventos.splice(idx, 1);
            return { affectedRows: 1 };
        }
        return { affectedRows: 0 };
    }

    // ACAO
    if (/SELECT \* FROM Acao WHERE acaoId = \?/i.test(normalSql)) {
        const val = Number(valores[0]);
        return acoes.filter(a => a.acaoId === val);
    }

    if (/SELECT \* FROM Acao WHERE eventoId = \?/i.test(normalSql)) {
        const val = Number(valores[0]);
        return acoes.filter(a => a.eventoId === val);
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

    // INSCRICAO (substituindo o antigo Participacao)
    if (/SELECT \* FROM Inscricao WHERE usuarioId = \? AND eventoId = \?/i.test(normalSql)) {
        const [uid, eid] = valores.map(Number);
        return inscricoes.filter(i => i.usuarioId === uid && i.eventoId === eid);
    }

    if (/SELECT .* FROM (Inscricao .* Usuario|Usuario .* Inscricao) .* WHERE i\.eventoId = \? AND i\.presente = \?/i.test(normalSql)) {
        const [eid, pres] = valores;
        const isPres = Boolean(Number(pres));
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

    if (/SELECT \* FROM Inscricao WHERE eventoId = \? AND presente = \?/i.test(normalSql)) {
        const [eid, pres] = valores;
        const isPres = Boolean(Number(pres));
        return inscricoes.filter(i => i.eventoId === Number(eid) && Boolean(i.presente) === isPres);
    }

    if (/SELECT \* FROM Inscricao WHERE eventoId = \?/i.test(normalSql)) {
        const [eid] = valores;
        return inscricoes.filter(i => i.eventoId === Number(eid));
    }

    if (/INSERT INTO Inscricao/i.test(normalSql)) {
        const [uid, eid, pres] = valores;
        const nova = {
            inscricaoId: nextInscricaoId++,
            usuarioId: Number(uid),
            eventoId: Number(eid),
            presente: Boolean(pres),
            dataInscricao: new Date()
        };
        inscricoes.push(nova);
        return { insertId: nova.inscricaoId, affectedRows: 1 };
    }

    if (/UPDATE Inscricao SET presente = \? WHERE usuarioId = \? AND eventoId = \?/i.test(normalSql)) {
        const [pres, uid, eid] = valores;
        const item = inscricoes.find(x => x.usuarioId === Number(uid) && x.eventoId === Number(eid));
        if (item) {
            item.presente = Boolean(Number(pres));
            return { affectedRows: 1 };
        }
        return { affectedRows: 0 };
    }

    // CERTIFICADO COM JOIN CORRETO (Inscricao + Usuario + Evento)
    if (/SELECT .* FROM Usuario .* Inscricao .* Evento .* WHERE u\.usuarioId = \? AND e\.eventoId = \?/i.test(normalSql)) {
        const [uid, eid] = valores.map(Number);
        const ins = inscricoes.find(i => i.usuarioId === uid && i.eventoId === eid);
        if (!ins) return [];
        const u = usuarios.find(user => user.usuarioId === uid);
        const e = eventos.find(event => event.eventoId === eid);
        if (!u || !e) return [];
        return [{
            nomeParticipante: u.nome,
            matricula: u.matricula,
            siape: u.siape,
            nomeEvento: e.nome,
            dataEvento: e.data,
            cargaHoraria: e.cargaHoraria,
            presente: ins.presente ? 1 : 0
        }];
    }

    if (/SELECT \* FROM Certificado WHERE usuarioId = \? AND eventoId = \?/i.test(normalSql)) {
        const [uid, eid] = valores.map(Number);
        return certificados.filter(c => c.usuarioId === uid && c.eventoId === eid);
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
                try {
                    const fallbackRes = executarSqlEmMemoria(sql, valores);
                    return callback(null, fallbackRes);
                } catch (fallbackErr) {
                    return callback(err);
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
                try {
                    const fallbackRes = executarSqlEmMemoria(sql, valores);
                    return callback(null, fallbackRes);
                } catch (fallbackErr) {
                    return callback(err);
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