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

export function login(dados){
    const { matricula, senha } = dados;

    const usuario = usuarios.find(u => u.matricula === matricula);

    if (!usuario) {
        throw new Error("Matrícula ou senha incorretos");
    }

    const senhaValida = bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
        throw new Error("Matrícula ou senha incorretos");
    }

    return usuario;
}

export function logout() {
    usuarios = [];
}
// quando o sistema funcionar ele vai pegar os dados do banco e otar no array, quando der logout ele vai apagar os dados do array
// quando tiver o banco de dados, o logout vai ser feito tanto no front quanto no back.