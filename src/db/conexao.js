import { createConnection } from 'mysql2';

const Conexao = createConnection({
  host: 'localhost',
  port: 3306,
  user: 'renan',
  password: 'Renan@1234',
  database: 'seac'
});

Conexao.connect((err) => {
  if (err) {
    console.error('Erro:', err);
    return;
  }
  console.log('conectado ao bd seac');
});

export default Conexao;