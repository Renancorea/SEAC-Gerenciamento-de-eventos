export async function login(dados) {

    const {
        identificador,
        senha,
        tipo
    } = dados;
    if (!identificador || !senha || tipo === undefined) {

        throw new Error(
            "Identificador, senha e tipo devem ser preenchidos"
        );

    }
    let resultado;

    if (tipo === 0) {
        resultado = await executar(
            `SELECT * FROM Usuario
             WHERE siape = ?`,
            [identificador]
        );

    } else {
        resultado = await executar(
            `SELECT * FROM Usuario
             WHERE matricula = ?`,
            [identificador]
        );
    }
    if (resultado.length === 0) {

        throw new Error(
            "Matrícula/SIAPE ou senha incorretos"
        );

    }
    const usuario = resultado[0];
    const senhaValida = await bcrypt.compare(
        senha,
        usuario.senha
    );

    if (!senhaValida) {
        throw new Error(
            "Matrícula/SIAPE ou senha incorretos"
        );
    }
    return usuario;

}