import bycrypt from "bcryptjs";

const usuarios = [
    {
    "nome": "Renan",
    "matricula": "2024096",
    "email": "renan@gmail.com",
    "tipo": 1,
    "senha": "123456"
},
{
    "nome": "Ana",
    "matricula": "2024034",
    "email": "ana@gmail.com",
    "tipo": 0,
    "siape": "1234567",
    "senha": "123456"
}
];


function cadastrar(dados) {

    const {
        nome,
        matricula,
        email,
        tipo,
        siape,
        senha
    } = dados;

    if (!nome || !matricula || !email || !tipo || !senha) {
        throw new Error(
            "Todos os campos devem ser preenchidos"
        );
    }

    if (tipo === 0 && !siape) {
        throw new Error(
            "Está faltando o siape"
        );
    }

    const matriculaExiste = usuarios.some(
        usuario => usuario.matricula === matricula
    );

    if (matriculaExiste) {
        throw new Error(
            "Esta matrícula já exidte"
        );
    }

    const emailExiste = usuarios.some(
        usuario => usuario.email === email
    );

    if (emailExiste) {
        throw new Error(
            "Este email já existe"
        );
    }

     const senhaHash = bcrypt.hash(senha, 10);

    const usuario = {
        id: usuarios.length + 1,
        nome,
        matricula,
        email,
        tipo,
        siape: tipo === 0 ? siape : null,
        senha: senhaHash,
        adm: false
    };

    usuarios.push(usuario);

    return usuario;
};

export default { cadastrar };

