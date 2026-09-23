class Tabelas{
    initialize(conexao){
        this.conexao = conexao;
    }
 
    criarTabelaUsuario(){
        const sql = `
        CREATE TABLE IF not exists Usuario (
        usuarioId INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        email VARCHAR(150) NOT NULL UNIQUE,
        matricula VARCHAR(20) UNIQUE,
        tipo TINYINT NOT NULL,
        siape VARCHAR(20) UNIQUE,
        senha VARCHAR(255) NOT NULL,
        adm BOOLEAN NOT NULL DEFAULT FALSE
        );
        `;
        this.conexao.query(sql, (erro) => {
            if(erro){
                console.error('Erro:', erro);
            } else {
                console.log('Tabela Usuario criada com sucesso!');
            }
            console.log("é pra ter criado")
        });

    }
    criarTabelaEvento(){
        const sql = `
        CREATE TABLE IF not exists Evento (
        eventoId INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        local VARCHAR(100) NOT NULL,
        data DATE NOT NULL,
        horario TIME NOT NULL,
        descricao TEXT,
        tipo VARCHAR(45),
        categoria VARCHAR(45),
        assentos INT,
        cargaHoraria DECIMAL(4,2),

        usuarioId INT NOT NULL,

        CONSTRAINT fk_evento_usuario
            FOREIGN KEY (usuarioId)
            REFERENCES Usuario(usuarioId)
            ON UPDATE CASCADE
            ON DELETE RESTRICT
        );
        `;
        this.conexao.query(sql, (erro) => {
            if(erro){
                console.error('Erro:', erro);
            } else {
                console.log('Tabela Evento criada com sucesso!');
            }
        });
    }
    criarTabelaAcao(){
        const sql = `
        CREATE TABLE IF not exists Acao (
        acaoId INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(100) NOT NULL,
        eventoId INT NOT NULL,

        CONSTRAINT fk_acao_evento
            FOREIGN KEY (eventoId)
            REFERENCES Evento(eventoId)
            ON UPDATE CASCADE
            ON DELETE CASCADE
    );
    `;
        this.conexao.query(sql, (erro) => {
            if(erro){
                console.error('Erro:', erro);
            } else {
                console.log('Tabela Acao criada com sucesso!');
            }
        });
    }
    criarTabelaInscricao(){
        const sql = `
        CREATE TABLE IF not exists Inscricao (
        inscricaoId INT AUTO_INCREMENT PRIMARY KEY,
        presente BOOLEAN DEFAULT FALSE,
        dataInscricao DATETIME DEFAULT CURRENT_TIMESTAMP,

        usuarioId INT NOT NULL,
        eventoId INT NOT NULL,

        CONSTRAINT inscricao_usuario
            FOREIGN KEY (usuarioId)
            REFERENCES Usuario(usuarioId)
            ON UPDATE CASCADE
            ON DELETE RESTRICT,

        CONSTRAINT inscricao_evento
            FOREIGN KEY (eventoId)
            REFERENCES Evento(eventoId)
            ON UPDATE CASCADE
            ON DELETE CASCADE,

        CONSTRAINT inscricao_usuario_evento
            UNIQUE (usuarioId, eventoId)
    );
        `;
        this.conexao.query(sql, (erro) => {
            if(erro){
                console.error('Erro:', erro);
            } else {
                console.log('Tabela Inscricao criada com sucesso!');
            }
        });
    }
    criarTabelaCertificado(){
        const sql = `
        CREATE TABLE IF not exists Certificado (
        certificadoId INT AUTO_INCREMENT PRIMARY KEY,

        cargaHoraria DECIMAL(4,2),
        arquivo VARCHAR(255),
        dataEmissao DATETIME DEFAULT CURRENT_TIMESTAMP,
        usuarioId INT NOT NULL,
        eventoId INT NOT NULL,

        CONSTRAINT certificado_usuario
            FOREIGN KEY (usuarioId)
            REFERENCES Usuario(usuarioId)
            ON UPDATE CASCADE
            ON DELETE RESTRICT,

        CONSTRAINT certificado_evento
            FOREIGN KEY (eventoId)
            REFERENCES Evento(eventoId)
            ON UPDATE CASCADE
            ON DELETE RESTRICT,

        CONSTRAINT certificado_usuario_evento
            UNIQUE (usuarioId, eventoId)
    );
    `;
        this.conexao.query(sql, (erro) => {
            if(erro){
                console.error('Erro:', erro);
            } else {
                console.log('Tabela Certificado criada com sucesso!');
            }
        });
    }
    criarTabelaEventoImagem(){
        const sql = `
        CREATE TABLE IF not exists EventoImagem (
        imagemId INT AUTO_INCREMENT PRIMARY KEY,
        nomeImagem VARCHAR(255),
        caminho VARCHAR(500),
        ordem INT,
        dataEnvio DATETIME DEFAULT CURRENT_TIMESTAMP,
        eventoId INT NOT NULL,

        CONSTRAINT evento_imagem_evento
            FOREIGN KEY (eventoId)
            REFERENCES Evento(eventoId)
            ON UPDATE CASCADE
            ON DELETE CASCADE
    );
    `;
        this.conexao.query(sql, (erro) => {
            if(erro){
                console.error('Erro:', erro);
            } else {
                console.log('Tabela EventoImagem criada com sucesso!');
            }
        }); 
    }

}