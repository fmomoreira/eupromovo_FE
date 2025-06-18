import axios from "axios";

// Configuração de ambiente
const isDevelopment = process.env.REACT_APP_ENVIRONMENT === 'development';

// URLs de backend para desenvolvimento e produção
const BACKEND_URL = {
  development: process.env.REACT_APP_DEV_BACKEND_URL || 'http://localhost:8080', // URL do backend local na porta 8080
  production: process.env.REACT_APP_BACKEND_URL // URL do backend de produção
};

// Seleciona a URL base baseada no ambiente
const baseURL = isDevelopment ? BACKEND_URL.development : BACKEND_URL.production;

// API com autenticação
const api = axios.create({
  baseURL,
  withCredentials: true, // Importante para autenticação com cookies
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// API aberta (sem autenticação)
export const openApi = axios.create({
  baseURL,
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptador para adicionar token de autenticação
api.interceptors.request.use(config => {
  try {
    // Obtem o token do localStorage no formato usado pelo sistema
    const token = JSON.parse(localStorage.getItem('token'));
    
    if (token) {
      // Adiciona o token no formato esperado pelo backend
      config.headers.Authorization = `Bearer ${token}`;
      console.debug('Token adicionado à requisição');
    }
  } catch (error) {
    console.warn('Erro ao processar token:', error);
    // Se houver erro ao processar o token, tenta usar diretamente
    const rawToken = localStorage.getItem('token');
    if (rawToken && rawToken !== 'null' && rawToken !== 'undefined') {
      config.headers.Authorization = `Bearer ${rawToken.replace(/"/g, '')}`;
    }
  }
  
  return config;
});

// Função para definir o token de autorização
export const setApiToken = (token) => {
  if (token) {
    // Armazena o token no formato correto
    localStorage.setItem('token', typeof token === 'string' ? token : JSON.stringify(token));
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    localStorage.removeItem('token');
    delete api.defaults.headers.common.Authorization;
  }
};

// Função de login
// Note: Esta função é para conveniência, o login real é implementado em useAuth.js
export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });
    // Não usamos setApiToken aqui pois o useAuth.js já lida com o armazenamento do token
    return response.data;
  } catch (error) {
    console.error('Erro de login:', error);
    throw error;
  }
};

// Função de logout
export const logout = () => {
  setApiToken(null);
};

export default api;
