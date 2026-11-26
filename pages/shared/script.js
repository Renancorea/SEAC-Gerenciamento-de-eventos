(async function () {
    const tipoPagina = document.body.dataset.tipo || (location.pathname.includes("/organizador/") ? "organizador" : "participante");
    const usuario = await SEACApi.validateSession();
    if (!usuario) {
        location.replace("/login/");
        return;
    }

    const tipoUsuario = Number(usuario.tipo) === 0 ? "organizador" : "participante";
    if (tipoUsuario !== tipoPagina) {
        location.replace(tipoUsuario === "organizador" ? "/organizador/" : "/participante/");
        return;
    }

    const params = new URLSearchParams(location.search);
    const idEvento = Number(params.get("id"));
    if (!idEvento) {
        location.replace("./");
        return;
    }

    const $ = (id) => document.getElementById(id);

    let eventoAtual = null;
    let acoesEvento = [];
    let statusInscricao = { inscrito: false, presente: false };

    function renderEvento() {
        if (!eventoAtual) return;
        $("nomeEvento").textContent = eventoAtual.nome || "Evento";
        $("nomeOrganizador").textContent = eventoAtual.organizadorNome || "Organizador IFCE";
        const tipoTexto = SEACApi.formatarTipo(eventoAtual.tipo);
        $("tipoEvento").textContent = tipoTexto;
        $("tipoRapido").textContent = tipoTexto;
        $("dataEvento").textContent = SEACApi.formatDatePtBr(eventoAtual.data);
        $("horarioEvento").textContent = String(eventoAtual.horario || "").slice(0, 5) || "--:--";
        $("localEvento").textContent = eventoAtual.local || "IFCE";
        $("descricaoEvento").textContent = eventoAtual.descricao || "Sem descrição informada.";
        $("numeroInscritos").textContent = eventoAtual.quantidadeInscritos ?? 0;
        $("numeroVagas").textContent = eventoAtual.assentos ?? 0;

        if ($("cargaHorariaRapida")) {
            $("cargaHorariaRapida").textContent = `${eventoAtual.cargaHoraria || 0}h`;
        }

        if (eventoAtual.imagem) {
            const capa = document.querySelector(".capa");
            if (capa) {
                capa.style.background = `linear-gradient(0deg, rgba(12, 49, 29, .88), rgba(0, 0, 0, .12)), url("${encodeURI(eventoAtual.imagem)}") center 48%/cover no-repeat`;
            }
        }

        const listaAtividades = $("listaAtividades");
        if (listaAtividades) {
            listaAtividades.innerHTML = "";
            if (acoesEvento.length === 0) {
                const li = document.createElement("li");
                li.textContent = "Nenhuma atividade cadastrada.";
                listaAtividades.appendChild(li);
            } else {
                acoesEvento.forEach((a) => {
                    const li = document.createElement("li");
                    li.textContent = a.nome;
                    listaAtividades.appendChild(li);
                });
            }
        }

        document.title = `SEAC - ${eventoAtual.nome}`;
    }

    async function carregarDetalhes() {
        try {
            const res = await SEACApi.apiRequest(`/eventos/detalhes/${idEvento}`);
            const detalhes = res.detalhesEventos;
            eventoAtual = detalhes.evento;
            acoesEvento = detalhes.acoes || [];
            renderEvento();
        } catch (erro) {
            $("nomeEvento").textContent = "Evento não encontrado";
            $("descricaoEvento").textContent = erro.message;
        }
    }

    function atualizarBotaoInscricao() {
        const btn = $("inscrever");
        const estado = $("estadoInscricao");
        const btnCertificado = $("btnCertificado");
        if (!btn || !estado) return;

        if (statusInscricao.inscrito) {
            btn.textContent = "Inscrito";
            btn.disabled = true;
            btn.style.background = "#d9e5ce";
            estado.textContent = statusInscricao.presente
                ? "Inscrição e presença confirmadas."
                : "Você está inscrito neste evento.";
            if (btnCertificado) {
                btnCertificado.style.display = statusInscricao.presente ? "block" : "none";
            }
        } else {
            btn.textContent = "Inscrever-se";
            btn.disabled = false;
            btn.style.background = "";
            estado.textContent = "";
            if (btnCertificado) btnCertificado.style.display = "none";
        }
    }

    await carregarDetalhes();

    if (tipoPagina === "organizador") {
        if ($("painelInscricao")) $("painelInscricao").style.display = "none";
        if ($("areaEditar")) $("areaEditar").style.display = "flex";
    } else {
        if ($("areaEditar")) $("areaEditar").style.display = "none";
        try {
            statusInscricao = await SEACApi.apiRequest(`/inscricoes/usuario/${usuario.usuarioId}/evento/${idEvento}`);
        } catch {
            statusInscricao = { inscrito: false, presente: false };
        }
        atualizarBotaoInscricao();

        $("inscrever")?.addEventListener("click", async () => {
            if (statusInscricao.inscrito) return;
            try {
                await SEACApi.apiRequest("/inscricoes", {
                    method: "POST",
                    body: JSON.stringify({ eventoId: idEvento })
                });
                statusInscricao.inscrito = true;
                await carregarDetalhes();
                atualizarBotaoInscricao();
            } catch (erro) {
                $("estadoInscricao").textContent = erro.message;
            }
        });

        $("btnCertificado")?.addEventListener("click", async () => {
            try {
                const res = await SEACApi.apiRequest("/certificados", {
                    method: "POST",
                    body: JSON.stringify({ eventoId: idEvento })
                });
                const cert = res.certificado;
                $("estadoInscricao").innerHTML = "";
                const msg = document.createElement("span");
                msg.textContent = "Certificado pronto: ";
                const link = document.createElement("a");
                link.href = cert.urlDownload;
                link.target = "_blank";
                link.rel = "noopener";
                link.textContent = "Abrir certificado";
                $("estadoInscricao").append(msg, link);
            } catch (erro) {
                $("estadoInscricao").textContent = erro.message;
            }
        });
    }

    // Comentários permanecem no navegador (sem endpoint de comentários no backend)
    const chaveComentarios = `seacComentarios_${idEvento}`;
    const comentariosIniciais = [
        { nome: "Ana Clara Lima Borges", texto: "Excelente organização! Sugiro que na próxima edição haja um espaço dedicado a startups do próprio IFCE apresentarem seus projetos.", data: "20/05/2026" },
        { nome: "Renan Lima Correia", texto: "O credenciamento poderia ser mais ágil. Talvez um sistema de QR Code para entrada agilize o processo no próximo evento.", data: "20/05/2026" }
    ];

    function renderComentarios() {
        let lista = JSON.parse(localStorage.getItem(chaveComentarios) || "null");
        if (!lista) {
            lista = comentariosIniciais;
            localStorage.setItem(chaveComentarios, JSON.stringify(lista));
        }
        const container = $("listaComentarios");
        container.innerHTML = "";
        lista.forEach((c) => {
            const article = document.createElement("article");
            article.className = "comentario";
            const topo = document.createElement("div");
            topo.className = "comentario-topo";
            const nome = document.createElement("strong");
            nome.textContent = c.nome;
            const data = document.createElement("time");
            data.textContent = c.data;
            topo.append(nome, data);
            const p = document.createElement("p");
            p.textContent = c.texto;
            article.append(topo, p);
            container.append(article);
        });
    }
    renderComentarios();

    $("formComentario")?.addEventListener("submit", (e) => {
        e.preventDefault();
        const texto = $("textoComentario").value.trim();
        if (!texto) return;
        const lista = JSON.parse(localStorage.getItem(chaveComentarios) || "[]");
        lista.unshift({ nome: usuario.nome, texto, data: new Date().toLocaleDateString("pt-BR") });
        localStorage.setItem(chaveComentarios, JSON.stringify(lista));
        $("textoComentario").value = "";
        $("avisoComentario").textContent = "Comentário salvo localmente.";
        renderComentarios();
    });

    $("baixarMaterial")?.addEventListener("click", (e) => {
        e.preventDefault();
        if (!eventoAtual) return;
        const conteudo = `${eventoAtual.nome}\n\n${eventoAtual.descricao || ""}\n\nData: ${SEACApi.formatDatePtBr(eventoAtual.data)}\nHorário: ${eventoAtual.horario}\nLocal: ${eventoAtual.local}`;
        const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `material-evento-${idEvento}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    });

    // Ações exclusivas do organizador (editar, excluir, inscritos e presença)
    if (tipoPagina === "organizador") {
        const modal = $("modalEdicao");
        const fecharModal = () => {
            modal.classList.remove("aberto");
            modal.setAttribute("aria-hidden", "true");
        };

        $("editarEvento")?.addEventListener("click", () => {
            if (!eventoAtual) return;
            $("editarNome").value = eventoAtual.nome || "";
            $("editarTipo").value = eventoAtual.tipo || "cientifico";
            $("editarData").value = String(eventoAtual.data || "").slice(0, 10);
            $("editarHorario").value = String(eventoAtual.horario || "").slice(0, 5);
            $("editarLocal").value = eventoAtual.local || "";
            $("editarDescricao").value = eventoAtual.descricao || "";
            if ($("editarAssentos")) $("editarAssentos").value = eventoAtual.assentos || 50;
            if ($("editarCargaHoraria")) $("editarCargaHoraria").value = eventoAtual.cargaHoraria || 10;
            if ($("erroEdicao")) $("erroEdicao").textContent = "";
            modal.classList.add("aberto");
            modal.setAttribute("aria-hidden", "false");
        });

        $("fecharModal")?.addEventListener("click", fecharModal);
        modal?.addEventListener("click", (e) => {
            if (e.target === modal) fecharModal();
        });

        $("formEdicao")?.addEventListener("submit", async (e) => {
            e.preventDefault();
            try {
                const payload = {
                    nome: $("editarNome").value.trim(),
                    tipo: $("editarTipo").value.trim(),
                    data: $("editarData").value.trim(),
                    horario: $("editarHorario").value.trim(),
                    local: $("editarLocal").value.trim(),
                    descricao: $("editarDescricao").value.trim()
                };
                if ($("editarAssentos")) payload.assentos = Number($("editarAssentos").value);
                if ($("editarCargaHoraria")) payload.cargaHoraria = Number($("editarCargaHoraria").value);

                await SEACApi.apiRequest(`/eventos/editar/${idEvento}`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });
                await carregarDetalhes();
                fecharModal();
            } catch (erro) {
                if ($("erroEdicao")) $("erroEdicao").textContent = erro.message;
            }
        });

        $("excluirEvento")?.addEventListener("click", async () => {
            try {
                await SEACApi.apiRequest(`/eventos/deletar/${idEvento}`, { method: "DELETE" });
                location.href = "./";
            } catch (erro) {
                if ($("avisoOrganizador")) $("avisoOrganizador").textContent = erro.message;
            }
        });

        const modalInscritos = $("modalInscritos");
        const fecharModalInscritos = () => {
            modalInscritos?.classList.remove("aberto");
            modalInscritos?.setAttribute("aria-hidden", "true");
        };

        async function carregarInscritos() {
            const listaEl = $("listaInscritosModal");
            if (!listaEl) return;
            listaEl.innerHTML = "<p>Carregando...</p>";
            try {
                const dados = await SEACApi.apiRequest(`/inscricoes/eventos/${idEvento}/inscritos`);
                listaEl.innerHTML = "";
                if (!dados.inscritos || dados.inscritos.length === 0) {
                    listaEl.textContent = "Nenhum inscrito até o momento.";
                    return;
                }
                dados.inscritos.forEach((ins) => {
                    const linha = document.createElement("div");
                    linha.className = "linha-inscrito";
                    const info = document.createElement("span");
                    info.textContent = `${ins.nome} (${ins.matricula || ins.siape || ins.email})`;
                    const btnPres = document.createElement("button");
                    btnPres.type = "button";
                    btnPres.className = "botao";
                    btnPres.textContent = ins.presente ? "Presente ✓" : "Marcar presença";
                    btnPres.addEventListener("click", async () => {
                        await SEACApi.apiRequest("/inscricoes/presenca", {
                            method: "PUT",
                            body: JSON.stringify({
                                usuarioId: ins.usuarioId,
                                eventoId: idEvento,
                                presente: !ins.presente
                            })
                        });
                        await carregarInscritos();
                    });
                    linha.append(info, btnPres);
                    listaEl.appendChild(linha);
                });
            } catch (erro) {
                listaEl.textContent = erro.message;
            }
        }

        $("verInscritos")?.addEventListener("click", async () => {
            modalInscritos?.classList.add("aberto");
            modalInscritos?.setAttribute("aria-hidden", "false");
            await carregarInscritos();
        });

        $("fecharModalInscritos")?.addEventListener("click", fecharModalInscritos);
        modalInscritos?.addEventListener("click", (e) => {
            if (e.target === modalInscritos) fecharModalInscritos();
        });

        $("gerarRelatorioEvento")?.addEventListener("click", async () => {
            try {
                const res = await SEACApi.apiRequest(`/relatorios/eventos/${idEvento}/usuarios`);
                if (res.relatorio?.urlDownload) {
                    window.open(res.relatorio.urlDownload, "_blank", "noopener");
                }
            } catch (erro) {
                if ($("avisoOrganizador")) $("avisoOrganizador").textContent = erro.message;
            }
        });
    }
})();
