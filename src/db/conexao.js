import conexao from 'mysql2';

const conexao = conexao.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'seac'
});

conexao.connect((err) => {
  if (err) {
    console.error('Erro:', err);
    return;
  }
  console.log('conectado ao bd seac');
});

export default conexao;