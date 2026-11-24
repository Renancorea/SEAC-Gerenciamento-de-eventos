const tipoUsuario = document.body.dataset.tipo || (location.pathname.includes('/organizador/') ? 'organizador' : 'participante');
const sessaoTexto = sessionStorage.getItem('seacUsuarioLogado');
if (!sessaoTexto) location.replace('../login/');
let sessao = {};
try { sessao = JSON.parse(sessaoTexto || '{}'); } catch { location.replace('../login/'); }
if (sessao.tipo && sessao.tipo !== tipoUsuario) location.replace(sessao.tipo === 'organizador' ? '../organizador/' : '../participante/');
const params = new URLSearchParams(location.search);
const idEvento = params.get('id') || 'evento-seac-01';
const chaveEventos = 'seacEventosDetalhes';
const padrao = { id: 'evento-seac-01', nome: 'Nome do Evento', organizador: 'Nome do Organizador', tipo: 'Tipo', data: '10/10/2026', horario: '16:20', local: 'Auditório Principal', descricao: 'Texto de exemplo: A Semana Acadêmica de Administração é o maior evento do curso, reunindo palestrantes do mercado corporativo, empreendedores e docentes da área. Programação inclui talks sobre empreendedorismo, gestão de pessoas, marketing digital, finanças corporativas e responsabilidade social empresarial. Atividade extracurricular reconhecida pela coordenação do curso. Certificado de 40 horas para participantes que cumprirem o mínimo de 75% de presença.', inscritos: 24, vagas: 100 };
let eventos = JSON.parse(localStorage.getItem(chaveEventos) || '[]');
if (!eventos.some(e => e.id === idEvento)) { eventos.push({ ...padrao, id: idEvento }); localStorage.setItem(chaveEventos, JSON.stringify(eventos)); }
let evento = eventos.find(e => e.id === idEvento) || padrao;
const $ = id => document.getElementById(id);
function salvarEventos() { localStorage.setItem(chaveEventos, JSON.stringify(eventos)); }
function renderEvento() { $('nomeEvento').textContent = evento.nome; $('nomeOrganizador').textContent = evento.organizador; $('tipoEvento').textContent = evento.tipo; $('tipoRapido').textContent = evento.tipo; $('dataEvento').textContent = evento.data; $('horarioEvento').textContent = evento.horario; $('localEvento').textContent = evento.local; $('descricaoEvento').textContent = evento.descricao; $('numeroInscritos').textContent = evento.inscritos || 0; $('numeroVagas').textContent = evento.vagas || 100; document.title = `SEAC - ${evento.nome}`; }
renderEvento();
const usuarioNome = sessao.nome || localStorage.getItem('seacNomeUsuario') || 'Participante';
const chaveInscricoes = 'seacInscricoes';
let inscricoes = JSON.parse(localStorage.getItem(chaveInscricoes) || '[]');
const inscrito = () => inscricoes.some(i => i.eventoId === idEvento && i.usuario === usuarioNome);
if (tipoUsuario === 'organizador') { $('painelInscricao').style.display = 'none'; $('areaEditar').style.display = 'flex'; } else { $('areaEditar').style.display = 'none'; atualizarBotaoInscricao(); }
function atualizarBotaoInscricao() { const b = $('inscrever'); if (inscrito()) { b.textContent = 'Cancelar inscrição'; b.style.background = '#d9e5ce'; $('estadoInscricao').textContent = 'Você está inscrito neste evento.'; } else { b.textContent = 'Inscrever-se'; b.style.background = ''; $('estadoInscricao').textContent = ''; } }
$('inscrever').addEventListener('click', () => { if (inscrito()) { inscricoes = inscricoes.filter(i => !(i.eventoId === idEvento && i.usuario === usuarioNome)); evento.inscritos = Math.max(0, (evento.inscritos || 0) - 1); $('estadoInscricao').textContent = 'Sua inscrição foi cancelada.'; } else { if ((evento.inscritos || 0) >= (evento.vagas || 100)) { $('estadoInscricao').textContent = 'Não há vagas disponíveis.'; return; } inscricoes.push({ eventoId: idEvento, usuario: usuarioNome }); evento.inscritos = (evento.inscritos || 0) + 1; $('estadoInscricao').textContent = 'Inscrição realizada com sucesso!'; } localStorage.setItem(chaveInscricoes, JSON.stringify(inscricoes)); salvarEventos(); renderEvento(); atualizarBotaoInscricao(); });
const chaveComentarios = 'seacComentarios_' + idEvento;
const comentariosIniciais = [{ nome: 'Ana Clara Lima Borges', texto: 'Excelente organização! Sugiro que na próxima edição haja um espaço dedicado a startups do próprio IFCE apresentarem seus projetos.', data: '20/05/2026' }, { nome: 'Renan Lima Correia', texto: 'O credenciamento poderia ser mais ágil. Talvez um sistema de QR Code para entrada agilize o processo no próximo evento.', data: '20/05/2026' }];
function renderComentarios() { let lista = JSON.parse(localStorage.getItem(chaveComentarios) || 'null'); if (!lista) { lista = comentariosIniciais; localStorage.setItem(chaveComentarios, JSON.stringify(lista)); } $('listaComentarios').innerHTML = ''; lista.forEach(c => { const article = document.createElement('article'); article.className = 'comentario'; const topo = document.createElement('div'); topo.className = 'comentario-topo'; const nome = document.createElement('strong'); nome.textContent = c.nome; const data = document.createElement('time'); data.textContent = c.data; topo.append(nome, data); const p = document.createElement('p'); p.textContent = c.texto; article.append(topo, p); $('listaComentarios').append(article); }); }
renderComentarios();
$('formComentario').addEventListener('submit', e => { e.preventDefault(); const texto = $('textoComentario').value.trim(); if (!texto) return; const lista = JSON.parse(localStorage.getItem(chaveComentarios) || '[]'); lista.unshift({ nome: usuarioNome, texto, data: new Date().toLocaleDateString('pt-BR') }); localStorage.setItem(chaveComentarios, JSON.stringify(lista)); $('textoComentario').value = ''; $('avisoComentario').textContent = 'Comentário enviado!'; renderComentarios(); });
$('baixarMaterial').addEventListener('click', e => {
    e.preventDefault(); const conteudo = `${evento.nome}

${evento.descricao}

Data: ${evento.data}
Horário: ${evento.horario}
Local: ${evento.local}`; const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'material-' + idEvento + '.txt'; a.click(); URL.revokeObjectURL(url);
});
if (tipoUsuario === 'organizador') { $('editarEvento').addEventListener('click', () => { ['Nome', 'Organizador', 'Tipo', 'Data', 'Horario', 'Local', 'Descricao'].forEach((campo) => { const map = { Nome: 'nome', Organizador: 'organizador', Tipo: 'tipo', Data: 'data', Horario: 'horario', Local: 'local', Descricao: 'descricao' }; $('editar' + campo).value = evento[map[campo]] || ''; }); $('modalEdicao').classList.add('aberto'); $('modalEdicao').setAttribute('aria-hidden', 'false'); }); const fechar = () => { $('modalEdicao').classList.remove('aberto'); $('modalEdicao').setAttribute('aria-hidden', 'true'); }; $('fecharModal').addEventListener('click', fechar); $('modalEdicao').addEventListener('click', e => { if (e.target === $('modalEdicao')) fechar(); }); $('formEdicao').addEventListener('submit', e => { e.preventDefault(); evento = { ...evento, nome: $('editarNome').value.trim(), organizador: $('editarOrganizador').value.trim(), tipo: $('editarTipo').value.trim(), data: $('editarData').value.trim(), horario: $('editarHorario').value.trim(), local: $('editarLocal').value.trim(), descricao: $('editarDescricao').value.trim() }; eventos = eventos.map(ev => ev.id === idEvento ? evento : ev); salvarEventos(); renderEvento(); fechar(); alert('Evento atualizado com sucesso!'); }); }
