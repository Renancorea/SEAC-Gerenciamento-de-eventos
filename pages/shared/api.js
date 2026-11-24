(function (global) {
    // Centralize aqui a URL base da API ao hospedar frontend e backend separadamente
    const API_BASE = global.SEAC_API_BASE || "/api";
    const TOKEN_KEY = "seac_token";
    const USER_KEY = "seac_usuario";

    function getToken() {
        return sessionStorage.getItem(TOKEN_KEY) || "";
    }

    function getStoredUser() {
        try {
            const raw = sessionStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function saveSession(token, usuario) {
        if (token) sessionStorage.setItem(TOKEN_KEY, token);
        if (usuario) sessionStorage.setItem(USER_KEY, JSON.stringify(usuario));
    }

    function clearSession() {
        sessionStorage.removeItem(TOKEN_KEY);
        sessionStorage.removeItem(USER_KEY);
    }

    async function apiRequest(endpoint, options = {}) {
        const token = getToken();
        const headers = {
            "Content-Type": "application/json",
            ...(options.headers || {})
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const resposta = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        let dados = {};
        const contentType = resposta.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
            dados = await resposta.json().catch(() => ({}));
        }

        if (!resposta.ok) {
            if (resposta.status === 401 && token && !endpoint.startsWith("/auth/login")) {
                clearSession();
            }
            const erro = new Error(dados.mensagem || "Erro ao comunicar com o servidor.");
            erro.status = resposta.status;
            erro.dados = dados;
            throw erro;
        }

        return dados;
    }

    async function validateSession() {
        const token = getToken();
        if (!token) {
            clearSession();
            return null;
        }

        try {
            const res = await apiRequest("/auth/me", { method: "GET" });
            if (res && res.usuario) {
                saveSession(token, res.usuario);
                return res.usuario;
            }
            clearSession();
            return null;
        } catch {
            clearSession();
            return null;
        }
    }

    async function logout() {
        const token = getToken();
        try {
            if (token) {
                await apiRequest("/auth/logout", {
                    method: "POST",
                    body: JSON.stringify({ token })
                });
            }
        } catch {
            // Ignora erro caso a sessão já tenha expirado no servidor
        } finally {
            clearSession();
        }
    }

    function escapeHtml(texto) {
        return String(texto ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function formatDatePtBr(dataStr) {
        if (!dataStr) return "Data a definir";
        const match = String(dataStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            return `${match[3]}/${match[2]}/${match[1]}`;
        }
        const dt = new Date(dataStr);
        if (isNaN(dt.getTime())) return String(dataStr);
        return dt.toLocaleDateString("pt-BR");
    }

    function getDayAndMonth(dataStr) {
        const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
        const match = String(dataStr || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
        if (match) {
            const mesIdx = Math.max(0, Math.min(11, Number(match[2]) - 1));
            return { dia: match[3], mes: meses[mesIdx] };
        }
        const dt = new Date(dataStr);
        if (isNaN(dt.getTime())) return { dia: "--", mes: "---" };
        return {
            dia: String(dt.getDate()).padStart(2, "0"),
            mes: meses[dt.getMonth()]
        };
    }

    function formatarTipo(tipo) {
        const mapa = {
            cientifico: "Científico",
            academico: "Acadêmico",
            cultural: "Cultural"
        };
        const chave = String(tipo || "").toLowerCase();
        return mapa[chave] || (tipo ? String(tipo) : "Evento");
    }

    function renderizarCardsEventos(gradeEl, eventos, aoAbrir) {
        gradeEl.innerHTML = "";
        eventos.forEach((ev, idx) => {
            const { dia, mes } = getDayAndMonth(ev.data);
            const card = document.createElement("article");
            card.className = "evento-card";
            card.tabIndex = 0;
            card.setAttribute("role", "link");
            card.setAttribute("aria-label", `Abrir detalhes de ${ev.nome}`);

            const capa = document.createElement("div");
            capa.className = `imagem-evento floresta-${(idx % 4) + 1}`;
            if (ev.imagem) {
                capa.style.backgroundImage = `url("${encodeURI(ev.imagem)}")`;
            }

            const etiqueta = document.createElement("span");
            etiqueta.className = "etiqueta-tipo";
            etiqueta.textContent = formatarTipo(ev.tipo);

            const badgeData = document.createElement("span");
            badgeData.className = "data-evento";
            const strongDia = document.createElement("strong");
            strongDia.textContent = dia;
            const smallMes = document.createElement("small");
            smallMes.textContent = mes;
            badgeData.append(strongDia, smallMes);

            capa.append(etiqueta, badgeData);

            const conteudo = document.createElement("div");
            conteudo.className = "conteudo-evento";

            const titulo = document.createElement("h3");
            titulo.textContent = ev.nome || "Evento";

            const organizador = document.createElement("p");
            organizador.className = "organizador";
            organizador.textContent = ev.organizadorNome || "Organizador IFCE";

            const local = document.createElement("span");
            local.className = "local-evento";
            const iconeLocal = document.createElement("img");
            iconeLocal.src = "/assets/iconLocal.png";
            iconeLocal.alt = "Local";
            local.append(iconeLocal, document.createTextNode(` ${ev.local || "IFCE"}`));

            const dados = document.createElement("div");
            dados.className = "dados-evento";
            const spanInscritos = document.createElement("span");
            spanInscritos.textContent = `${ev.quantidadeInscritos ?? 0} inscritos`;
            const spanVagas = document.createElement("span");
            spanVagas.textContent = `${ev.assentosDisponiveis ?? ev.assentos ?? 0} vagas`;
            dados.append(spanInscritos, spanVagas);

            conteudo.append(titulo, organizador, local, dados);
            card.append(capa, conteudo);

            if (typeof aoAbrir === "function") {
                card.addEventListener("click", () => aoAbrir(ev));
                card.addEventListener("keydown", (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        aoAbrir(ev);
                    }
                });
            }

            gradeEl.appendChild(card);
        });
    }

    global.SEACApi = {
        API_BASE,
        getToken,
        getStoredUser,
        saveSession,
        clearSession,
        apiRequest,
        validateSession,
        logout,
        escapeHtml,
        formatDatePtBr,
        getDayAndMonth,
        formatarTipo,
        renderizarCardsEventos
    };
})(window);
