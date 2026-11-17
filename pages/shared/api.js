(function (global) {
    const API_BASE = "/api";
    const TOKEN_KEY = "seac_token";
    const USER_KEY = "seac_usuario";

    function getToken() {
        return localStorage.getItem(TOKEN_KEY) || "";
    }

    function getStoredUser() {
        try {
            const raw = localStorage.getItem(USER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    function saveSession(token, usuario) {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        if (usuario) localStorage.setItem(USER_KEY, JSON.stringify(usuario));
    }

    function clearSession() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
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
            // Mesmo se o servidor já tiver encerrado a sessão, limpa localmente
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

    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Não foi possível ler o arquivo selecionado."));
            reader.readAsDataURL(file);
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
        fileToBase64
    };
})(window);
