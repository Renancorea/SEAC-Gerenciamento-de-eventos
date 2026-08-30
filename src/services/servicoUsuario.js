import bycrypt from "bcryptjs";

const usuarios = [
    {
    "nome": "Renan",
    "matricula": "2024001",
    "email": "renan@gmail.com",
    "tipo": 1,
    "senha": "123456"
},
{
    "nome": "Ana",
    "matricula": null,
    "email": "ana@gmail.com",
    "tipo": 0,
    "siape": "1234567",
    "senha": "123456"
}
];


export function cadastrar(dados) {

    const {
        nome,
        matricula,
        email,
        tipo,
        siape,
        senha
    } = dados;
    if (tipo === 0) {

        if (!nome || !siape || !email || !tipo || !senha) {
        throw new Error(
            "Todos os campos devem ser preenchidos"
        );
    }
       if (!siape) {
        throw new Error(
            "Está faltando o siape"
        );
    }
    const siapeExiste = usuarios.some(
        usuario => usuario.siape === siape
    );

    if (siapeExiste) {
        throw new Error(
            "Este siape já existe"
        );
    }

    const emailExiste = usuarios.some(
        usuario => usuario.email === email
    );
    // esse some é de someone, alguem em ingles kkkkkk.
    if (emailExiste) {
        throw new Error(
            "Este email já existe"
        );
    }

    }
    else{

        if (!nome || !matricula || !email || !tipo || !senha) {
            throw new Error(
                "Todos os campos devem ser preenchidos"
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
        // esse some é de someone, alguem em ingles kkkkkk.
        if (emailExiste) {
            throw new Error(
                "Este email já existe"
            );
        }
    }
        
     const senhaHash = bcrypt.hash(senha, 10);
    // Mt legal esse bcrypt, hash nem...

    const usuario = {
        id: usuarios.length + 1,
        nome,
        matricula: tipo === 1 ? matricula : null,
        email,
        tipo,
        siape: tipo === 0 ? siape : null,
        senha: senhaHash,
        adm: false
    };

    usuarios.push(usuario);

    return usuario;
};

