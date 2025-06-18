import { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { has, isArray } from "lodash";

import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { SocketContext } from "../../context/Socket/SocketContext";
import moment from "moment";
import axios from "axios";
const useAuth = () => {
  const history = useHistory();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState({});
  const [refreshToken, setRefreshToken] = useState(null);

  const getDeviceModel = () => {
    const userAgent = navigator.userAgent;

    if (/iPhone/.test(userAgent)) return "iPhone";
    if (/iPad/.test(userAgent)) return "iPad";
    if (/Mac/.test(userAgent)) return "Mac";
    if (/Android/.test(userAgent)) return "Android Device";
    if (/Windows/.test(userAgent)) return "Windows PC";

    return "Unknown Device";
  };

  const getOrCreateUniqueId = () => {
    let uniqueId = localStorage.getItem("deviceId");
    if (!uniqueId) {
      uniqueId = uuidv4();
      localStorage.setItem("deviceId", uniqueId);
    }
    return uniqueId;
  };

  const [modelo, setModelo] = useState(getDeviceModel());
  const [serie, setSerie] = useState(getOrCreateUniqueId());

  api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers["Authorization"] = `Bearer ${JSON.parse(token)}`;
        setIsAuth(true);
      }
      return config;
    },
    (error) => {
      Promise.reject(error);
    }
  );

  api.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      const token = localStorage.getItem("refreshToken");
      console.log("REFRESH TOKEN BEFORE SEND =>", token);
      if (error?.response?.status === 403 && !originalRequest._retry) {
        originalRequest._retry = true;

        console.log(
          "Token antes da requisição:",
          localStorage.getItem("token")
        );

        const { data } = await api.post("/auth/refresh_token", {
          token: JSON.parse(token),
        });
        if (data) {
          console.log("Novo token gerado:", data.token);

          localStorage.setItem("token", JSON.stringify(data.token));
          api.defaults.headers.Authorization = `Bearer ${data.token}`;
        }
        return api(originalRequest);
      }
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("companyId");
        api.defaults.headers.Authorization = undefined;
        console.log("Erro 401:", error.response);

        console.log("IS AUTH PARA FALSE 1");
        setIsAuth(false);
      }
      return Promise.reject(error);
    }
  );

  const socketManager = useContext(SocketContext);

  useEffect(() => {
    const token = localStorage.getItem("refreshToken");
    console.log("REFRESH TOKEN BEFORE SEND =>", token);
    (async () => {
      if (token) {
        try {
          const { data } = await api.post("/auth/refresh_token", {
            token: JSON.parse(token),
          });
          api.defaults.headers.Authorization = `Bearer ${data.token}`;
          setIsAuth(true);
          setUser(data.user);
        } catch (err) {
          toastError(err);
        }
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    if (companyId) {
      const socket = socketManager.getSocket(companyId);

      socket.on(`company-${companyId}-user`, (data) => {
        if (data.action === "update" && data.user.id === user.id) {
          setUser(data.user);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [socketManager, user]);

  const handleLogin = async (userData) => {
    setLoading(true);

    console.log("USERDATA", userData);
    try {
      const { data } = await api.post("/auth/login", userData);
      const {
        user: { companyId, id, company },
      } = data;
      console.log("USER RESPONSE", data.token === data.refreshToken);
      setRefreshToken(data.refreshToken);
      if (has(company, "settings") && isArray(company.settings)) {
        const setting = company.settings.find(
          (s) => s.key === "campaignsEnabled"
        );
        if (setting && setting.value === "true") {
          localStorage.setItem("cshow", null); //regra pra exibir campanhas
        }
      }

      moment.locale("pt-br");
      const dueDate = data.user.company.dueDate;
      const hoje = moment(moment()).format("DD/MM/yyyy");
      const vencimento = moment(dueDate).format("DD/MM/yyyy");

      var diff = moment(dueDate).diff(moment(moment()).format());

      var before = moment(moment().format()).isBefore(dueDate);
      var dias = moment.duration(diff).asDays();

      if (before === true) {
        localStorage.setItem("token", JSON.stringify(data.token));
        localStorage.setItem("refreshToken", JSON.stringify(data.refreshToken));
        localStorage.setItem("companyId", companyId);
        localStorage.setItem("userId", id);
        localStorage.setItem("companyDueDate", vencimento);
        api.defaults.headers.Authorization = `Bearer ${data.token}`;
        setUser(data.user);
        setIsAuth(true);
        toast.success(i18n.t("auth.toasts.success"));
        if (Math.round(dias) < 5) {
          toast.warn(
            `Sua assinatura vence em ${Math.round(dias)} ${
              Math.round(dias) === 1 ? "dia" : "dias"
            } `
          );
        }

        console.log("INDO PARA TICKETS");
        history.push("/tickets");
        setLoading(false);
      } else {
        toastError(`Opss! Sua assinatura venceu ${vencimento}.
      Entre em contato com o Suporte para mais informações! `);
        setLoading(false);
      }
      fetchApiProducts();

      //quebra linha
    } catch (err) {
      toastError("erro login");
      setLoading(false);
    }
  };

  const fetchApiProducts = async () => {
    try {
      const usu = {
        username: "3",
        password: "",
        tipo: false,
        serie: serie,
        aparelho: modelo,
      };

      console.log("USUARIO A SER ENVIADO", usu);
      const h = {
        headers: { tid: "04888471000139".replace(/[^0-9]/g, "") },
        timeout: 10000,
      };
      const response = await axios.post(
        `http://localhost:8787/usuarios/acessar/app`,
        usu,
        h
      );

      localStorage.setItem("@token", `Bearer ${response.data.token}`);
      localStorage.setItem("@codloja", `${response.data.codloja}`);

      console.log("RESPONSe", response.data.token);
    } catch (error) {
      console.log("ERROR LOGIN API 8787");
    }
  };

  const handleLogout = async () => {
    setLoading(true);

    try {
      await api.delete("/auth/logout");

      console.log("IS AUTH PARA FALSE 2");

      setIsAuth(false);
      setUser({});
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("token");
      localStorage.removeItem("companyId");
      localStorage.removeItem("userId");
      localStorage.removeItem("cshow");
      api.defaults.headers.Authorization = undefined;
      setLoading(false);
      history.push("/login");
    } catch (err) {
      toastError(err);
      setLoading(false);
    }
  };

  const getCurrentUserInfo = async () => {
    try {
      const token = localStorage.getItem("refreshToken");
      const { data } = await api.get(`/auth/me/${JSON.parse(token)}`);
      return data;
    } catch (err) {
      toastError(err);
    }
  };

  return {
    isAuth,
    user,
    loading,
    handleLogin,
    handleLogout,
    getCurrentUserInfo,
  };
};

export default useAuth;
