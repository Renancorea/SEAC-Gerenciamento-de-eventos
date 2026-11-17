(function () {
    const campoBusca = document.getElementById("campoBusca");
    const filtroTipo = document.getElementById("filtroTipo");
    const ordenacao = document.getElementById("ordenacao");
    const gradeEventos = document.getElementById("gradeEventos");
    const contadorEventos = document.getElementById("contadorEventos");
    const semResultados = document.getElementById("semResultados");
    const acoesUsuario = document.getElementById("acoesUsuario");
    const heroSecundario = document.getElementById("heroSecundario");
    const btnNovoEventoCatalogo = document.getElementById("btnNovoEventoCatalogo");
    const feedbackCatalogo = document.getElementById("feedbackCatalogo");
    const rodapeLogin = document.getElementById("rodapeLogin");
    const rodapeCadastro = document.getElementById("rodapeCadastro");

    const modalEvento = document.getElementById("modalEvento");
    const modalEventoConteudo = document.getElementById("modalEventoConteudo");
    const modalFormularioEvento = document.getElementById("modalFormularioEvento");
    const formEvento = document.getElementById("formEvento");
    const tituloFormEvento = document.getElementById("tituloFormEvento");
    const feedbackFormEvento = document.getElementById("feedbackFormEvento");
    const btnSalvarEvento = document.getElementById("btnSalvarEvento");
    const modalMinhaArea = document.getElementById("modalMinhaArea");
    const conteudoMinhaArea = document.getElementById("conteudoMinhaArea");
    const modalRelatorios = document.getElementById("modalRelatorios");
    const conteudoRelatorios = document.getElementById("conteudoRelatorios");

    let usuarioAtual = null;
    let eventosCarregados = [];
    let debounceTimer = null;

    function mostrarFeedbackCatalogo(msg, tipo = "sucesso") {
        feedbackCatalogo.textContent = msg;
        feedbackCatalogo.className = `feedback-catalogo ${tipo}`;
        setTimeout(() => {
            feedbackCatalogo.className = "feedback-catalogo";
            feedbackCatalogo.textContent = "";
        }, 4500);
    }

    function abrirModal(modal) {
        modal.classList.add("aberto");
    }

    function fecharModal(modal) {
        modal.classList.remove("aberto");
    }

    document.querySelectorAll("[data-fechar]").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = btn.getAttribute("data-fechar");
            const el = document.getElementById(id);
            if (el) fecharModal(el);
        });
    });

    [modalEvento, modalFormularioEvento, modalMinhaArea, modalRelatorios].forEach((modal) => {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) fecharModal(modal);
        });
    });

    function atualizarCabecalhoSessao() {
        const esc = SEACApi.escapeHtml;
        if (!usuarioAtual) {
            acoesUsuario.innerHTML = `
                <a href="../login/" class="link-entrar">Entrar</a>
                <a href="../cadastro/" class="botao-topo">Cadastre-se</a>
            `;
            btnNovoEventoCatalogo.style.display = "none";
            heroSecundario.textContent = "Criar conta";
            heroSecundario.href = "../cadastro/";
            heroSecundario.onclick = null;
            if (rodapeLogin) rodapeLogin.style.display = "";
            if (rodapeCadastro) rodapeCadastro.style.display = "";
            return;
        }

        const ehOrganizador = Number(usuarioAtual.tipo) === 0;
        const perfilLabel = ehOrganizador
            ? (usuarioAtual.adm ? "Admin" : "Organizador")
            : "Participante";

        acoesUsuario.innerHTML = `
            <span class="usuario-chip">
                <strong>${esc(usuarioAtual.nome)}</strong>
                <span class="usuario-perfil">${perfilLabel}</span>
            </span>
            <button type="button" class="botao-header-acao" id="btnMinhaArea">Inscrições & Certificados</button>
            ${ehOrganizador ? `<button type="button" class="botao-header-acao" id="btnRelatorios">Relatórios</button>` : ""}
            ${ehOrganizador ? `<button type="button" class="botao-topo" id="btnNovoEventoTopo">+ Novo Evento</button>` : ""}
            <button type="button" class="botao-sair" id="btnSair">Sair</button>
        `;

        btnNovoEventoCatalogo.style.display = ehOrganizador ? "inline-block" : "none";

        if (ehOrganizador) {
            heroSecundario.textContent = "+ Novo Evento";
            heroSecundario.href = "#";
            heroSecundario.onclick = (e) => {
                e.preventDefault();
                abrirFormularioEvento(null);
            };
        } else {
            heroSecundario.textContent = "Meus Certificados";
            heroSecundario.href = "#";
            heroSecundario.onclick = (e) => {
                e.preventDefault();
                abrirMinhaArea();
            };
        }

        if (rodapeLogin) rodapeLogin.style.display = "none";
        if (rodapeCadastro) rodapeCadastro.style.display = "none";

        document.getElementById("btnMinhaArea").addEventListener("click", abrirMinhaArea);
        if (ehOrganizador) {
            document.getElementById("btnRelatorios").addEventListener("click", abrirRelatorios);
            document.getElementById("btnNovoEventoTopo").addEventListener("click", () => abrirFormularioEvento(null));
        }
        document.getElementById("btnSair").addEventListener("click", async () => {
            await SEACApi.logout();
            usuarioAtual = null;
            atualizarCabecalhoSessao();
            mostrarFeedbackCatalogo("Sessão encerrada com sucesso.");
        });
    }

    function ordenarEventos(lista) {
        const copia = [...lista];
        const ord = ordenacao.value;
        copia.sort((a, b) => {
            const da = new Date(a.data).getTime() || 0;
            const db = new Date(b.data).getTime() || 0;
            return ord === "desc" ? db - da : da - db;
        });
        return copia;
    }

    function renderizarEventos() {
        const esc = SEACApi.escapeHtml;
        const lista = ordenarEventos(eventosCarregados);
        gradeEventos.innerHTML = "";

        if (lista.length === 0) {
            contadorEventos.textContent = "0 Eventos encontrados";
            semResultados.style.display = "block";
            return;
        }

        semResultados.style.display = "none";
        contadorEventos.textContent = `${lista.length} ${lista.length === 1 ? "Evento encontrado" : "Eventos encontrados"}`;

        lista.forEach((ev) => {
            const { dia, mes } = SEACApi.getDayAndMonth(ev.data);
            const imgBg = ev.imagem ? esc(ev.imagem) : "/assets/fundoFloresta.png";
            const inscritos = Number(ev.quantidadeInscritos) || 0;
            const disponiveis = ev.assentosDisponiveis != null ? Number(ev.assentosDisponiveis) : Number(ev.assentos || 0);
            const tipoLabel = ev.tipo || "evento";

            const card = document.createElement("article");
            card.className = "evento-card";
            card.setAttribute("tabindex", "0");
            card.setAttribute("role", "button");
            card.setAttribute("aria-label", `Ver detalhes de ${ev.nome}`);

            card.innerHTML = `
                <div class="imagem-evento" style="background-image: url('${imgBg}')">
                    <div class="data-evento">
                        <strong>${esc(dia)}</strong>
                        <small>${esc(mes)}</small>
                    </div>
                    <div class="tipo-evento">${esc(tipoLabel)}</div>
                </div>
                <div class="conteudo-evento">
                    <h3>${esc(ev.nome)}</h3>
                    <p class="organizador">${esc(ev.organizadorNome || "Organizador IFCE")}</p>
                    <span class="local-evento">
                        <img src="/assets/iconLocal.png" alt="Local">
                        ${esc(ev.local)}
                    </span>
                    <div class="dados-evento">
                        <span>${inscritos} ${inscritos === 1 ? "inscrito" : "inscritos"}</span>
                        <span>${disponiveis} ${disponiveis === 1 ? "vaga" : "vagas"}</span>
                    </div>
                </div>
            `;

            card.addEventListener("click", () => abrirDetalhesEvento(ev.eventoId));
            card.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    abrirDetalhesEvento(ev.eventoId);
                }
            });

            gradeEventos.appendChild(card);
        });
    }

    async function carregarEventosDaApi() {
        const params = new URLSearchParams();
        const termo = campoBusca.value.trim();
        const tipo = filtroTipo.value;

        if (termo) params.set("pesquisa", termo);
        if (tipo && tipo !== "todos") params.set("tipo", tipo);

        const qs = params.toString() ? `?${params.toString()}` : "";
        contadorEventos.textContent = "Carregando eventos...";

        try {
            const res = await SEACApi.apiRequest(`/eventos${qs}`, { method: "GET" });
            eventosCarregados = res.eventos || [];
            renderizarEventos();
        } catch (erro) {
            contadorEventos.textContent = "Não foi possível carregar os eventos.";
            mostrarFeedbackCatalogo(erro.message || "Erro ao consultar eventos.", "erro");
        }
    }

    async function abrirDetalhesEvento(eventoId) {
        const esc = SEACApi.escapeHtml;
        modalEventoConteudo.innerHTML = `<p>Carregando detalhes do evento...</p>`;
        abrirModal(modalEvento);

        try {
            const res = await SEACApi.apiRequest(`/eventos/detalhes/${eventoId}`, { method: "GET" });
            const { evento, organizador, acoes = [] } = res.detalhesEventos;
            const imgBg = evento.imagem ? esc(evento.imagem) : "/assets/fundoFloresta.png";

            let statusInscricao = null;
            let meusCertificados = [];

            if (usuarioAtual) {
                try {
                    statusInscricao = await SEACApi.apiRequest(
                        `/inscricoes/usuario/${usuarioAtual.usuarioId}/evento/${evento.eventoId}`,
                        { method: "GET" }
                    );
                } catch {
                    statusInscricao = null;
                }

                try {
                    const certRes = await SEACApi.apiRequest("/certificados/meus", { method: "GET" });
                    meusCertificados = certRes.certificados || [];
                } catch {
                    meusCertificados = [];
                }
            }

            const ehDonoOuAdmin = usuarioAtual &&
                Number(usuarioAtual.tipo) === 0 &&
                (Boolean(usuarioAtual.adm) || Number(evento.idOrganizador) === Number(usuarioAtual.usuarioId));

            const certDoEvento = meusCertificados.find((c) => Number(c.eventoId) === Number(evento.eventoId));

            let blocoAcaoUsuario = "";
            if (!usuarioAtual) {
                blocoAcaoUsuario = `
                    <div class="barra-acoes-modal">
                        <a href="../login/" class="btn-primario-modal">Entrar para se inscrever</a>
                    </div>
                `;
            } else {
                const inscrito = Boolean(statusInscricao?.inscrito);
                const presente = Boolean(statusInscricao?.presente);
                const semVagas = Number(evento.assentosDisponiveis) <= 0;

                let botoesParticipacao = "";
                if (!inscrito) {
                    botoesParticipacao = `
                        <button type="button" class="btn-primario-modal" id="btnInscreverEvento" ${semVagas ? "disabled" : ""}>
                            ${semVagas ? "Vagas esgotadas" : "Inscrever-se neste evento"}
                        </button>
                    `;
                } else if (presente) {
                    if (certDoEvento) {
                        botoesParticipacao = `
                            <span class="badge-seac">Presença confirmada</span>
                            <a href="${esc(certDoEvento.urlDownload)}" target="_blank" rel="noopener noreferrer" class="btn-primario-modal">
                                Abrir Certificado (${esc(certDoEvento.formato.toUpperCase())})
                            </a>
                        `;
                    } else {
                        botoesParticipacao = `
                            <span class="badge-seac">Presença confirmada</span>
                            <button type="button" class="btn-primario-modal" id="btnEmitirMeuCertificado">
                                Emitir Meu Certificado
                            </button>
                        `;
                    }
                } else {
                    botoesParticipacao = `
                        <span class="badge-seac">Inscrição confirmada (aguardando registro de presença)</span>
                    `;
                }

                blocoAcaoUsuario = `<div class="barra-acoes-modal">${botoesParticipacao}</div>`;
            }

            const blocoGestaoOrganizador = ehDonoOuAdmin ? `
                <div class="detalhe-secao">
                    <h3>Gerenciamento do Organizador</h3>
                    <div class="barra-acoes-modal" style="margin-top: 8px;">
                        <button type="button" class="btn-secundario-modal" id="btnEditarEsteEvento">Editar Evento</button>
                        <button type="button" class="btn-secundario-modal" id="btnGerarRelatorioEvento">Relatório de Participantes</button>
                        <button type="button" class="btn-perigo-modal" id="btnPedirExclusao">Excluir Evento</button>
                    </div>
                    <div id="confirmacaoExclusao" style="display:none; margin-top:10px; padding:10px; background:#fdecec; border-radius:6px; font-size:13px;">
                        <span>Tem certeza que deseja excluir este evento? Esta ação não pode ser desfeita.</span>
                        <div style="margin-top:8px; display:flex; gap:8px;">
                            <button type="button" class="btn-perigo-modal" id="btnConfirmarExclusao">Confirmar Exclusão</button>
                            <button type="button" class="btn-secundario-modal" id="btnCancelarExclusao">Cancelar</button>
                        </div>
                    </div>

                    <div style="margin-top: 14px;">
                        <label style="font-size:12px; font-weight:bold; display:block; margin-bottom:6px;">Atualizar imagem de capa do evento</label>
                        <div class="inline-add">
                            <input type="file" id="inputUploadImagemDetalhe" accept="image/png,image/jpeg,image/webp">
                            <button type="button" class="btn-mini verde" id="btnEnviarImagemDetalhe">Enviar Imagem</button>
                        </div>
                    </div>

                    <div id="areaRelatorioEvento" style="margin-top: 10px;"></div>
                </div>

                <div class="detalhe-secao">
                    <h3>Inscritos e Registro de Presença</h3>
                    <div id="listaInscritosEvento"><p style="font-size:13px;">Carregando inscritos...</p></div>
                </div>
            ` : "";

            modalEventoConteudo.innerHTML = `
                <div class="detalhe-capa" style="background-image: url('${imgBg}')"></div>
                <div class="detalhe-badges">
                    <span class="badge-seac">${esc(evento.tipo || "Evento")}</span>
                    ${evento.categoria ? `<span class="badge-seac">${esc(evento.categoria)}</span>` : ""}
                    <span class="badge-seac">${esc(evento.cargaHoraria || 0)}h de carga horária</span>
                </div>
                <h2 id="modalEventoTitulo" class="modal-titulo" style="margin-bottom: 8px;">${esc(evento.nome)}</h2>
                <div id="feedbackDetalheEvento" class="feedback-modal" role="alert"></div>
                <div class="detalhe-meta">
                    <div><strong>Data:</strong> ${esc(SEACApi.formatDatePtBr(evento.data))}</div>
                    <div><strong>Horário:</strong> ${esc(evento.horario || "--:--")}</div>
                    <div><strong>Local:</strong> ${esc(evento.local)}</div>
                    <div><strong>Organizador:</strong> ${esc(organizador?.nome || evento.organizadorNome || "IFCE")}</div>
                    <div><strong>Inscritos:</strong> ${Number(evento.quantidadeInscritos) || 0} de ${Number(evento.assentos) || 0}</div>
                    <div><strong>Vagas disponíveis:</strong> ${Number(evento.assentosDisponiveis) || 0}</div>
                </div>
                ${evento.descricao ? `<p class="detalhe-descricao">${esc(evento.descricao)}</p>` : ""}

                ${blocoAcaoUsuario}

                <div class="detalhe-secao">
                    <h3>Programação / Ações do Evento</h3>
                    ${ehDonoOuAdmin ? `
                        <div class="inline-add">
                            <input type="text" id="inputNovaAcao" placeholder="Nome da atividade (ex: Palestra de Abertura)">
                            <button type="button" class="btn-mini verde" id="btnAdicionarAcao">Adicionar</button>
                        </div>
                    ` : ""}
                    <ul class="lista-acoes-evento" id="listaAcoesModal">
                        ${acoes.length === 0
                            ? `<li><span>Nenhuma ação cadastrada para este evento.</span></li>`
                            : acoes.map((a) => `
                                <li>
                                    <span>${esc(a.nome)}</span>
                                    ${ehDonoOuAdmin ? `<button type="button" class="btn-mini vermelho" data-remover-acao="${a.acaoId}">Remover</button>` : ""}
                                </li>
                            `).join("")}
                    </ul>
                </div>

                ${blocoGestaoOrganizador}
            `;

            const feedbackDet = document.getElementById("feedbackDetalheEvento");
            function setFeedbackDetalhe(msg, tipo = "erro") {
                feedbackDet.textContent = msg;
                feedbackDet.className = `feedback-modal ${tipo}`;
            }

            const btnInscrever = document.getElementById("btnInscreverEvento");
            if (btnInscrever) {
                btnInscrever.addEventListener("click", async () => {
                    btnInscrever.disabled = true;
                    btnInscrever.textContent = "Inscrevendo...";
                    try {
                        await SEACApi.apiRequest("/inscricoes", {
                            method: "POST",
                            body: JSON.stringify({ eventoId: evento.eventoId })
                        });
                        await carregarEventosDaApi();
                        await abrirDetalhesEvento(evento.eventoId);
                    } catch (erro) {
                        setFeedbackDetalhe(erro.message);
                        btnInscrever.disabled = false;
                        btnInscrever.textContent = "Inscrever-se neste evento";
                    }
                });
            }

            const btnEmitirMeu = document.getElementById("btnEmitirMeuCertificado");
            if (btnEmitirMeu) {
                btnEmitirMeu.addEventListener("click", async () => {
                    btnEmitirMeu.disabled = true;
                    btnEmitirMeu.textContent = "Gerando certificado...";
                    try {
                        const certRes = await SEACApi.apiRequest("/certificados/gerar", {
                            method: "POST",
                            body: JSON.stringify({
                                usuarioId: usuarioAtual.usuarioId,
                                eventoId: evento.eventoId
                            })
                        });
                        setFeedbackDetalhe("Certificado emitido com sucesso!", "sucesso");
                        await abrirDetalhesEvento(evento.eventoId);
                        if (certRes?.certificado?.urlDownload) {
                            const area = document.getElementById("feedbackDetalheEvento");
                            if (area) {
                                area.innerHTML = `Certificado pronto! <a href="${esc(certRes.certificado.urlDownload)}" target="_blank" rel="noopener noreferrer" style="font-weight:bold; text-decoration:underline;">Abrir Certificado</a>`;
                                area.className = "feedback-modal sucesso";
                            }
                        }
                    } catch (erro) {
                        setFeedbackDetalhe(erro.message);
                        btnEmitirMeu.disabled = false;
                        btnEmitirMeu.textContent = "Emitir Meu Certificado";
                    }
                });
            }

            if (ehDonoOuAdmin) {
                document.getElementById("btnEditarEsteEvento").addEventListener("click", () => {
                    fecharModal(modalEvento);
                    abrirFormularioEvento(evento);
                });

                const boxExclusao = document.getElementById("confirmacaoExclusao");
                document.getElementById("btnPedirExclusao").addEventListener("click", () => {
                    boxExclusao.style.display = "block";
                });
                document.getElementById("btnCancelarExclusao").addEventListener("click", () => {
                    boxExclusao.style.display = "none";
                });
                document.getElementById("btnConfirmarExclusao").addEventListener("click", async () => {
                    try {
                        await SEACApi.apiRequest(`/eventos/deletar/${evento.eventoId}`, {
                            method: "DELETE"
                        });
                        fecharModal(modalEvento);
                        mostrarFeedbackCatalogo("Evento excluído com sucesso.");
                        await carregarEventosDaApi();
                    } catch (erro) {
                        boxExclusao.style.display = "none";
                        setFeedbackDetalhe(erro.message);
                    }
                });

                document.getElementById("btnEnviarImagemDetalhe").addEventListener("click", async () => {
                    const input = document.getElementById("inputUploadImagemDetalhe");
                    const file = input.files?.[0];
                    if (!file) {
                        setFeedbackDetalhe("Selecione uma imagem PNG, JPG ou WEBP primeiro.");
                        return;
                    }
                    try {
                        const base64 = await SEACApi.fileToBase64(file);
                        await SEACApi.apiRequest(`/eventos/${evento.eventoId}/imagem`, {
                            method: "POST",
                            body: JSON.stringify({
                                nomeImagem: file.name,
                                imagemBase64: base64
                            })
                        });
                        await carregarEventosDaApi();
                        await abrirDetalhesEvento(evento.eventoId);
                    } catch (erro) {
                        setFeedbackDetalhe(erro.message);
                    }
                });

                document.getElementById("btnAdicionarAcao").addEventListener("click", async () => {
                    const inputAcao = document.getElementById("inputNovaAcao");
                    const nome = inputAcao.value.trim();
                    if (!nome) {
                        setFeedbackDetalhe("Informe o nome da ação.");
                        return;
                    }
                    try {
                        await SEACApi.apiRequest("/acoes", {
                            method: "POST",
                            body: JSON.stringify({ nome, eventoId: evento.eventoId })
                        });
                        await abrirDetalhesEvento(evento.eventoId);
                    } catch (erro) {
                        setFeedbackDetalhe(erro.message);
                    }
                });

                document.querySelectorAll("[data-remover-acao]").forEach((btnRem) => {
                    btnRem.addEventListener("click", async () => {
                        const acaoId = btnRem.getAttribute("data-remover-acao");
                        try {
                            await SEACApi.apiRequest(`/acoes/${acaoId}`, { method: "DELETE" });
                            await abrirDetalhesEvento(evento.eventoId);
                        } catch (erro) {
                            setFeedbackDetalhe(erro.message);
                        }
                    });
                });

                document.getElementById("btnGerarRelatorioEvento").addEventListener("click", async () => {
                    const area = document.getElementById("areaRelatorioEvento");
                    area.innerHTML = `<p style="font-size:13px;">Gerando relatório...</p>`;
                    try {
                        const rel = await SEACApi.apiRequest(`/relatorios/eventos/${evento.eventoId}/usuarios`, {
                            method: "GET"
                        });
                        const info = rel.relatorio;
                        area.innerHTML = `
                            <div class="feedback-modal sucesso" style="display:block;">
                                Relatório gerado (${info.totalInscritos} inscritos).
                                <a href="${esc(info.urlDownload)}" target="_blank" rel="noopener noreferrer" style="font-weight:bold; text-decoration:underline; margin-left:8px;">
                                    Abrir Relatório (${esc(info.formato.toUpperCase())})
                                </a>
                            </div>
                        `;
                    } catch (erro) {
                        area.innerHTML = `<div class="feedback-modal erro" style="display:block;">${esc(erro.message)}</div>`;
                    }
                });

                carregarInscritosNoModal(evento.eventoId, setFeedbackDetalhe);
            }
        } catch (erro) {
            modalEventoConteudo.innerHTML = `<div class="feedback-modal erro" style="display:block;">${esc(erro.message)}</div>`;
        }
    }

    async function carregarInscritosNoModal(eventoId, setFeedbackDetalhe) {
        const esc = SEACApi.escapeHtml;
        const container = document.getElementById("listaInscritosEvento");
        if (!container) return;

        try {
            const dados = await SEACApi.apiRequest(`/inscricoes/eventos/${eventoId}/inscritos`, {
                method: "GET"
            });

            const inscritos = dados.inscritos || [];
            if (inscritos.length === 0) {
                container.innerHTML = `<p style="font-size:13px; color:#555;">Nenhum participante inscrito até o momento.</p>`;
                return;
            }

            container.innerHTML = `
                <table class="tabela-seac">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Identificação</th>
                            <th>Presença</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${inscritos.map((ins) => `
                            <tr>
                                <td>${esc(ins.nome)}</td>
                                <td>${esc(ins.matricula || ins.siape || ins.email)}</td>
                                <td>${ins.presente ? "Presente" : "Pendente"}</td>
                                <td style="display:flex; gap:6px; flex-wrap:wrap;">
                                    <button type="button"
                                        class="btn-mini ${ins.presente ? "" : "verde"}"
                                        data-presenca-uid="${ins.usuarioId}"
                                        data-presenca-val="${ins.presente ? "0" : "1"}">
                                        ${ins.presente ? "Desmarcar" : "Confirmar Presença"}
                                    </button>
                                    ${ins.presente ? `
                                        <button type="button" class="btn-mini verde" data-emitir-cert-uid="${ins.usuarioId}">
                                            Certificado
                                        </button>
                                    ` : ""}
                                </td>
                            </tr>
                        `).join("")}
                    </tbody>
                </table>
                <div id="linkCertificadoGeradoOrg" style="margin-top:10px;"></div>
            `;

            container.querySelectorAll("[data-presenca-uid]").forEach((btn) => {
                btn.addEventListener("click", async () => {
                    const uid = Number(btn.getAttribute("data-presenca-uid"));
                    const novoPresente = btn.getAttribute("data-presenca-val") === "1";
                    try {
                        await SEACApi.apiRequest("/inscricoes/presenca", {
                            method: "PUT",
                            body: JSON.stringify({
                                usuarioId: uid,
                                eventoId,
                                presente: novoPresente
                            })
                        });
                        await carregarInscritosNoModal(eventoId, setFeedbackDetalhe);
                    } catch (erro) {
                        setFeedbackDetalhe(erro.message);
                    }
                });
            });

            container.querySelectorAll("[data-emitir-cert-uid]").forEach((btn) => {
                btn.addEventListener("click", async () => {
                    const uid = Number(btn.getAttribute("data-emitir-cert-uid"));
                    const box = document.getElementById("linkCertificadoGeradoOrg");
                    btn.disabled = true;
                    try {
                        const res = await SEACApi.apiRequest("/certificados/gerar", {
                            method: "POST",
                            body: JSON.stringify({ usuarioId: uid, eventoId })
                        });
                        const cert = res.certificado;
                        box.innerHTML = `
                            <div class="feedback-modal sucesso" style="display:block;">
                                Certificado de ${esc(cert.nomeParticipante)} pronto!
                                <a href="${esc(cert.urlDownload)}" target="_blank" rel="noopener noreferrer" style="font-weight:bold; text-decoration:underline; margin-left:6px;">
                                    Visualizar Certificado
                                </a>
                            </div>
                        `;
                    } catch (erro) {
                        setFeedbackDetalhe(erro.message);
                    } finally {
                        btn.disabled = false;
                    }
                });
            });
        } catch (erro) {
            container.innerHTML = `<div class="feedback-modal erro" style="display:block;">${esc(erro.message)}</div>`;
        }
    }

    function abrirFormularioEvento(evento = null) {
        feedbackFormEvento.className = "feedback-modal";
        feedbackFormEvento.textContent = "";
        formEvento.reset();

        if (evento) {
            tituloFormEvento.textContent = "Editar Evento";
            document.getElementById("eventoIdForm").value = evento.eventoId;
            document.getElementById("evNome").value = evento.nome || "";
            document.getElementById("evLocal").value = evento.local || "";
            document.getElementById("evData").value = String(evento.data || "").slice(0, 10);
            document.getElementById("evHorario").value = String(evento.horario || "").slice(0, 5);
            document.getElementById("evTipo").value = evento.tipo || "cientifico";
            document.getElementById("evCategoria").value = evento.categoria || "";
            document.getElementById("evAssentos").value = evento.assentos || "";
            document.getElementById("evCarga").value = evento.cargaHoraria || "";
            document.getElementById("evDescricao").value = evento.descricao || "";
        } else {
            tituloFormEvento.textContent = "Novo Evento";
            document.getElementById("eventoIdForm").value = "";
        }

        abrirModal(modalFormularioEvento);
    }

    formEvento.addEventListener("submit", async (e) => {
        e.preventDefault();
        feedbackFormEvento.className = "feedback-modal";
        feedbackFormEvento.textContent = "";

        const idEdicao = document.getElementById("eventoIdForm").value;
        const payload = {
            nome: document.getElementById("evNome").value.trim(),
            local: document.getElementById("evLocal").value.trim(),
            data: document.getElementById("evData").value,
            horario: document.getElementById("evHorario").value,
            tipo: document.getElementById("evTipo").value,
            categoria: document.getElementById("evCategoria").value.trim(),
            assentos: Number(document.getElementById("evAssentos").value),
            cargaHoraria: document.getElementById("evCarga").value
                ? Number(document.getElementById("evCarga").value)
                : 4,
            descricao: document.getElementById("evDescricao").value.trim()
        };

        const arquivoImagem = document.getElementById("evImagem").files?.[0] || null;

        btnSalvarEvento.disabled = true;
        btnSalvarEvento.textContent = "Salvando...";

        try {
            let eventoSalvo;
            if (idEdicao) {
                const res = await SEACApi.apiRequest(`/eventos/editar/${idEdicao}`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });
                eventoSalvo = res.eventoEditado;
            } else {
                const res = await SEACApi.apiRequest("/eventos/cadastrar", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
                eventoSalvo = res.evento;
            }

            if (arquivoImagem && eventoSalvo?.eventoId) {
                const base64 = await SEACApi.fileToBase64(arquivoImagem);
                await SEACApi.apiRequest(`/eventos/${eventoSalvo.eventoId}/imagem`, {
                    method: "POST",
                    body: JSON.stringify({
                        nomeImagem: arquivoImagem.name,
                        imagemBase64: base64
                    })
                });
            }

            fecharModal(modalFormularioEvento);
            mostrarFeedbackCatalogo(idEdicao ? "Evento atualizado com sucesso!" : "Evento cadastrado com sucesso!");
            await carregarEventosDaApi();
        } catch (erro) {
            feedbackFormEvento.textContent = erro.message || "Erro ao salvar evento.";
            feedbackFormEvento.className = "feedback-modal erro";
        } finally {
            btnSalvarEvento.disabled = false;
            btnSalvarEvento.textContent = "Salvar Evento";
        }
    });

    async function abrirMinhaArea() {
        const esc = SEACApi.escapeHtml;
        conteudoMinhaArea.innerHTML = `<p>Carregando suas inscrições e certificados...</p>`;
        abrirModal(modalMinhaArea);

        try {
            const [resIns, resCert] = await Promise.all([
                SEACApi.apiRequest("/inscricoes/minhas", { method: "GET" }),
                SEACApi.apiRequest("/certificados/meus", { method: "GET" })
            ]);

            const inscricoes = resIns.inscricoes || [];
            const certificados = resCert.certificados || [];

            conteudoMinhaArea.innerHTML = `
                <div class="detalhe-secao" style="margin-top:0; padding-top:0; border-top:none;">
                    <h3>Minhas Inscrições (${inscricoes.length})</h3>
                    ${inscricoes.length === 0
                        ? `<p style="font-size:13px; color:#555;">Você ainda não possui inscrições em eventos.</p>`
                        : `
                        <table class="tabela-seac">
                            <thead>
                                <tr>
                                    <th>Evento</th>
                                    <th>Data / Local</th>
                                    <th>Situação</th>
                                    <th>Ação</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${inscricoes.map((i) => `
                                    <tr>
                                        <td><strong>${esc(i.nomeEvento)}</strong></td>
                                        <td>${esc(SEACApi.formatDatePtBr(i.dataEvento))} — ${esc(i.localEvento)}</td>
                                        <td>${i.presente ? "Presença confirmada" : "Inscrito"}</td>
                                        <td>
                                            ${i.presente
                                                ? `<button type="button" class="btn-mini verde" data-emitir-area-eid="${i.eventoId}">Emitir Certificado</button>`
                                                : `<button type="button" class="btn-mini" data-ver-evento-eid="${i.eventoId}">Ver Evento</button>`}
                                        </td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    `}
                </div>

                <div class="detalhe-secao">
                    <h3>Meus Certificados Emitidos (${certificados.length})</h3>
                    ${certificados.length === 0
                        ? `<p style="font-size:13px; color:#555;">Nenhum certificado emitido até o momento.</p>`
                        : `
                        <table class="tabela-seac">
                            <thead>
                                <tr>
                                    <th>Evento</th>
                                    <th>Carga Horária</th>
                                    <th>Código</th>
                                    <th>Arquivo</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${certificados.map((c) => `
                                    <tr>
                                        <td><strong>${esc(c.nomeEvento)}</strong></td>
                                        <td>${esc(c.cargaHoraria)}h</td>
                                        <td>${esc(c.codigo)}</td>
                                        <td>
                                            <a href="${esc(c.urlDownload)}" target="_blank" rel="noopener noreferrer" class="btn-mini verde">
                                                Abrir (${esc(c.formato.toUpperCase())})
                                            </a>
                                        </td>
                                    </tr>
                                `).join("")}
                            </tbody>
                        </table>
                    `}
                </div>
            `;

            conteudoMinhaArea.querySelectorAll("[data-ver-evento-eid]").forEach((btn) => {
                btn.addEventListener("click", () => {
                    const eid = Number(btn.getAttribute("data-ver-evento-eid"));
                    fecharModal(modalMinhaArea);
                    abrirDetalhesEvento(eid);
                });
            });

            conteudoMinhaArea.querySelectorAll("[data-emitir-area-eid]").forEach((btn) => {
                btn.addEventListener("click", async () => {
                    const eid = Number(btn.getAttribute("data-emitir-area-eid"));
                    btn.disabled = true;
                    btn.textContent = "Gerando...";
                    try {
                        await SEACApi.apiRequest("/certificados/gerar", {
                            method: "POST",
                            body: JSON.stringify({
                                usuarioId: usuarioAtual.usuarioId,
                                eventoId: eid
                            })
                        });
                        await abrirMinhaArea();
                    } catch (erro) {
                        mostrarFeedbackCatalogo(erro.message, "erro");
                        btn.disabled = false;
                        btn.textContent = "Emitir Certificado";
                    }
                });
            });
        } catch (erro) {
            conteudoMinhaArea.innerHTML = `<div class="feedback-modal erro" style="display:block;">${esc(erro.message)}</div>`;
        }
    }

    function abrirRelatorios() {
        const esc = SEACApi.escapeHtml;
        const ehAdmin = Boolean(usuarioAtual?.adm);

        conteudoRelatorios.innerHTML = `
            <p style="font-size:13px; color:#444; margin-bottom:14px;">
                Gere relatórios oficiais do SEAC a partir dos dados cadastrados no sistema.
            </p>
            <div class="barra-acoes-modal" style="margin-top:0;">
                <button type="button" class="btn-primario-modal" id="btnRelatorioEventosGeral">Relatório Geral de Eventos</button>
                ${ehAdmin ? `<button type="button" class="btn-secundario-modal" id="btnRelatorioUsuariosGeral">Relatório Geral de Usuários (Admin)</button>` : ""}
            </div>
            <div id="resultadoRelatorioGeral" style="margin-top:16px;"></div>
        `;

        abrirModal(modalRelatorios);

        const box = document.getElementById("resultadoRelatorioGeral");

        document.getElementById("btnRelatorioEventosGeral").addEventListener("click", async () => {
            box.innerHTML = `<p style="font-size:13px;">Gerando relatório de eventos...</p>`;
            try {
                const res = await SEACApi.apiRequest("/relatorios/eventos", { method: "GET" });
                const rel = res.relatorio;
                box.innerHTML = `
                    <div class="feedback-modal sucesso" style="display:block;">
                        Relatório Geral de Eventos gerado (${rel.totalEventos} eventos).
                        <a href="${esc(rel.urlDownload)}" target="_blank" rel="noopener noreferrer" style="font-weight:bold; text-decoration:underline; margin-left:8px;">
                            Abrir Relatório (${esc(rel.formato.toUpperCase())})
                        </a>
                    </div>
                `;
            } catch (erro) {
                box.innerHTML = `<div class="feedback-modal erro" style="display:block;">${esc(erro.message)}</div>`;
            }
        });

        const btnUsu = document.getElementById("btnRelatorioUsuariosGeral");
        if (btnUsu) {
            btnUsu.addEventListener("click", async () => {
                box.innerHTML = `<p style="font-size:13px;">Gerando relatório de usuários...</p>`;
                try {
                    const res = await SEACApi.apiRequest("/relatorios/usuarios", { method: "GET" });
                    const rel = res.relatorio;
                    box.innerHTML = `
                        <div class="feedback-modal sucesso" style="display:block;">
                            Relatório Geral de Usuários gerado (${rel.totalUsuarios} usuários).
                            <a href="${esc(rel.urlDownload)}" target="_blank" rel="noopener noreferrer" style="font-weight:bold; text-decoration:underline; margin-left:8px;">
                                Abrir Relatório (${esc(rel.formato.toUpperCase())})
                            </a>
                        </div>
                    `;
                } catch (erro) {
                    box.innerHTML = `<div class="feedback-modal erro" style="display:block;">${esc(erro.message)}</div>`;
                }
            });
        }
    }

    btnNovoEventoCatalogo.addEventListener("click", () => abrirFormularioEvento(null));

    campoBusca.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(carregarEventosDaApi, 220);
    });
    filtroTipo.addEventListener("change", carregarEventosDaApi);
    ordenacao.addEventListener("change", renderizarEventos);

    async function inicializar() {
        usuarioAtual = await SEACApi.validateSession();
        atualizarCabecalhoSessao();
        await carregarEventosDaApi();
    }

    inicializar();
})();
