# Configurações para Ambiente de Desenvolvimento Local

Este documento descreve todas as configurações e alterações necessárias para executar o projeto Esquadrao_FE localmente, com foco na comunicação com o backend e configuração de ambientes.

## Sumário

1. [Configuração de Variáveis de Ambiente](#1-configuração-de-variáveis-de-ambiente)
2. [Configuração da API e Autenticação](#2-configuração-da-api-e-autenticação)
3. [Configuração de WebSocket](#3-configuração-de-websocket)
4. [Resolução de Problemas](#4-resolução-de-problemas)

---

## 1. Configuração de Variáveis de Ambiente

### Arquivos Criados/Modificados

- `.env`: Variáveis de ambiente para desenvolvimento local
- `.env.example`: Modelo com todas as variáveis de ambiente disponíveis

### Principais Variáveis

```bash
# Ambiente (development ou production)
REACT_APP_ENVIRONMENT=development

# URLs do Backend
REACT_APP_DEV_BACKEND_URL=http://localhost:8080
REACT_APP_BACKEND_URL=https://url-de-producao.com

# Configurações de API
REACT_APP_API_TIMEOUT=30000

# Debug
REACT_APP_DEBUG=true

# Título da aplicação
REACT_APP_TITLE="Esquadrão - Desenvolvimento"
```

### Como Funciona

O sistema detecta automaticamente qual ambiente está sendo usado através da variável `REACT_APP_ENVIRONMENT`. Isso permite alternar facilmente entre desenvolvimento local e produção sem mudar o código da aplicação.

## 2. Configuração da API e Autenticação

### Arquivos Modificados

- `src/services/api.js`

### Principais Mudanças

1. **Configuração do Axios baseada em ambiente**

```javascript
// Configuração de ambiente
const isDevelopment = process.env.REACT_APP_ENVIRONMENT === 'development';

// URLs de backend para desenvolvimento e produção
const BACKEND_URL = {
  development: process.env.REACT_APP_DEV_BACKEND_URL || 'http://localhost:8080',
  production: process.env.REACT_APP_BACKEND_URL
};

// Seleciona a URL base baseada no ambiente
const baseURL = isDevelopment ? BACKEND_URL.development : BACKEND_URL.production;
```

2. **Configuração de Autenticação JWT**

```javascript
// Interceptador para adicionar token de autenticação
api.interceptors.request.use(config => {
  try {
    // Obtem o token do localStorage no formato usado pelo sistema
    const token = JSON.parse(localStorage.getItem('token'));
    
    if (token) {
      // Adiciona o token no formato esperado pelo backend
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.warn('Erro ao processar token:', error);
    // Se houver erro ao processar o token, tenta usar diretamente
    const rawToken = localStorage.getItem('token');
    if (rawToken && rawToken !== 'null' && rawToken !== 'undefined') {
      config.headers.Authorization = `Bearer ${rawToken.replace(/\"/g, '')}`;
    }
  }
  
  return config;
});
```

3. **Timeout e Headers Padronizados**

```javascript
const api = axios.create({
  baseURL,
  withCredentials: true, // Importante para autenticação com cookies
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT || '30000'),
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});
```

## 3. Configuração de WebSocket

### Arquivos Modificados

- `src/context/Socket/SocketContext.js`

### Principais Mudanças

1. **URL do WebSocket baseada em ambiente**

```javascript
const isDevelopment = process.env.REACT_APP_ENVIRONMENT === 'development';

const wsBackendUrl = isDevelopment 
  ? (process.env.REACT_APP_DEV_BACKEND_URL || 'http://localhost:8080')
  : process.env.REACT_APP_BACKEND_URL;

// Configuração do socket
this.currentSocket = openSocket(wsBackendUrl, {
  transports: ["websocket"],
  pingTimeout: 18000,
  pingInterval: 18000,
  query: { token },
});
```

## 4. Resolução de Problemas

### Problema de Autenticação (Erro 403)

O erro 403 (Forbidden) ocorria após o login devido ao formato incorreto do token JWT nas requisições. A solução envolveu:

1. **Entender o formato do token**:
   - O sistema original armazena o token como JSON stringificado no localStorage:
     ```javascript
     localStorage.setItem("token", JSON.stringify(data.token));
     ```

2. **Corrigir o interceptor**:
   - Garantir que o token seja devidamente processado antes de ser enviado:
     ```javascript
     try {
       const token = JSON.parse(localStorage.getItem('token'));
       if (token) {
         config.headers.Authorization = `Bearer ${token}`;
       }
     } catch (error) {
       // Tratamento de fallback para garantir compatibilidade
     }
     ```

3. **Compatibilidade com sistema existente**:
   - Respeitar a implementação original em `useAuth.js` para evitar conflitos na gestão do token.

### CORS e Cookies

O backend está configurado para aceitar requisições de `http://localhost:3000`, então é importante:

1. Manter o frontend rodando nesta porta durante o desenvolvimento
2. Garantir que `withCredentials: true` esteja configurado no Axios para envio correto de cookies e headers

## Executando o Projeto

Para iniciar o projeto em ambiente de desenvolvimento:

```bash
npm start
```

A aplicação ficará disponível em `http://localhost:3000` e se comunicará com o backend em `http://localhost:8080` conforme configurado.

---

*Documentação atualizada em: 31 de maio de 2025*
