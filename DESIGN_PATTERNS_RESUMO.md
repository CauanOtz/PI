# 📝 Resumo dos Design Patterns - Projeto PI

## 🎯 Visão Geral

O projeto PI utiliza **mais de 35 design patterns** diferentes, demonstrando uma arquitetura robusta e bem estruturada para o sistema de gestão da ONG Associação Nova Geração.

Para a **documentação completa e detalhada**, consulte: **[DESIGN_PATTERNS.md](./DESIGN_PATTERNS.md)**

---

## 📊 Padrões Identificados por Categoria

### 🔨 Padrões Criacionais (5)
1. **Singleton** - Conexão única do banco de dados, Storage único
2. **Factory** - Inicialização de modelos, criação de componentes
3. **Provider** - Context API do React para autenticação

### 🏗️ Padrões Estruturais (9)
4. **MVC** - Arquitetura Model-View-Controller
5. **Adapter** - Normalização de CPF, telefone e respostas da API
6. **Decorator** - Setters/getters em modelos (hash de senha)
7. **Facade** - Camada de serviços, funções utilitárias
8. **Composite** - Componentes React aninhados
9. **Module** - Barrel exports para organização
10. **Proxy** - Interceptors HTTP do Axios

### 🔄 Padrões Comportamentais (11)
11. **Middleware/Chain of Responsibility** - Pipeline de requisições Express
12. **Strategy** - Seleção dinâmica de banco de dados
13. **Observer** - Hooks do Sequelize, useState/useEffect do React
14. **Template Method** - Padrão comum nos controllers
15. **Interceptor** - Interceptors de requisição/resposta HTTP
16. **Custom Hooks** - useAsync, useAuth
17. **Validation Pipeline** - express-validator em cadeia

### 🏛️ Padrões Arquiteturais (10)
18. **Layered Architecture** - Camadas separadas (Routes → Middlewares → Controllers → Models → DB)
19. **RESTful API** - API seguindo princípios REST
20. **Monorepo** - Frontend e backend no mesmo repositório
21. **Environment Configuration** - Variáveis de ambiente (.env)
22. **Service Layer** - Camada de serviços no frontend
23. **Container/Presentational** - Separação de componentes React
24. **Active Record** - Padrão do Sequelize ORM
25. **Repository Pattern** - Controllers como repositórios

### 🔗 Padrões de Integração (7)
26. **API Gateway** - Ponto único de entrada para APIs
27. **DTO (Data Transfer Object)** - Objetos de transferência com TypeScript
28. **Pagination** - Paginação de dados
29. **Error Handling** - Tratamento centralizado de erros
30. **Dependency Injection** - Injeção via parâmetros
31. **Validation Pipeline** - Validação em etapas
32. **OpenAPI/Swagger** - Documentação automática da API

---

## 🔍 Padrões Mais Relevantes do Projeto

### Backend (Node.js/Express)

#### 1. MVC - Arquitetura Principal
```
Routes → Middlewares → Controllers → Models → Database
```

#### 2. Middleware Pattern - Segurança e Validação
```javascript
router.put('/:cpf', 
  autenticar,                    // Autenticação JWT
  validateAtualizarUsuario,      // Validação de dados
  usuarioController.atualizarUsuarioPorCPF
);
```

#### 3. Active Record - ORM Sequelize
```javascript
const Usuario = sequelize.define('Usuario', {...});
Usuario.prototype.gerarToken = function() {...};
```

#### 4. Strategy - Conexão Dinâmica ao Banco
```javascript
if (databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {...});      // PostgreSQL/MySQL
} else if (dbDialect === 'sqlite') {
  sequelize = new Sequelize({dialect: 'sqlite', ...}); // SQLite
}
```

### Frontend (React/TypeScript)

#### 1. Provider Pattern - Gestão de Estado Global
```typescript
export function AuthProvider({ children }) {
  const [authed, setAuthed] = useState(isAuthenticated());
  const [user, setUser] = useState(null);
  // ...
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
```

#### 2. Custom Hooks - Reutilização de Lógica
```typescript
export function useAsync<T>(asyncFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // ...
  return { data, loading, error, run, reset };
}
```

#### 3. Service Layer - Abstração de API
```typescript
// services/auth.ts
export async function login({ email, password }) {
  const res = await http.post("/usuarios/login", { email, senha: password });
  tokenStorage.set(res.data.token);
  return res.data;
}
```

#### 4. Interceptor - Autenticação Automática
```typescript
http.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

---

## 💡 Benefícios da Arquitetura

### ✅ Manutenibilidade
- Separação clara de responsabilidades
- Código organizado em camadas
- Padrões consistentes em todo o projeto

### ✅ Escalabilidade
- Fácil adicionar novos recursos
- Componentes e serviços independentes
- Arquitetura modular

### ✅ Testabilidade
- Componentes isolados
- Serviços mockáveis
- Lógica de negócio separada da UI

### ✅ Segurança
- Autenticação JWT
- Validação de dados em múltiplas camadas
- Middleware de autenticação/autorização

### ✅ Documentação
- Swagger/OpenAPI para API
- Tipos TypeScript
- Comentários JSDoc

---

## 📂 Estrutura do Projeto

### Backend
```
backend/src/
├── config/          # Configurações (database, swagger)
├── controllers/     # Lógica de negócio
├── middlewares/     # Autenticação, validação
│   └── validators/  # Validadores de entrada
├── models/          # Modelos Sequelize (Active Record)
├── routes/          # Definição de rotas REST
└── utils/           # Funções utilitárias (CPF, etc)
```

### Frontend
```
frontend/src/
├── components/      # Componentes UI reutilizáveis
│   ├── ui/         # Componentes base (botões, inputs)
│   └── modals/     # Modais específicos
├── context/        # Context API (AuthProvider)
├── hooks/          # Custom hooks (useAsync)
├── services/       # Camada de serviços (API)
├── screens/        # Telas/páginas principais
├── types/          # Tipos TypeScript
└── lib/            # Utilitários (http, storage, format)
```

---

## 🎓 Padrões de Design Aplicados por Tecnologia

### Sequelize ORM
- ✅ Active Record
- ✅ Repository Pattern
- ✅ Singleton (conexão)
- ✅ Factory (inicialização de modelos)

### Express.js
- ✅ MVC
- ✅ Middleware/Chain of Responsibility
- ✅ Template Method (controllers)
- ✅ Dependency Injection

### React + TypeScript
- ✅ Provider Pattern (Context API)
- ✅ Custom Hooks
- ✅ Container/Presentational
- ✅ Composite (componentes)
- ✅ Service Layer

### Axios
- ✅ Interceptor Pattern
- ✅ Singleton (instância http)
- ✅ Facade (abstração de requisições)

---

## 🚀 Como os Padrões Melhoram o Código

### Exemplo: Adicionar Nova Entidade

Graças aos padrões estabelecidos, adicionar uma nova entidade segue um fluxo claro:

1. **Model** (`models/NovaEntidade.model.js`) - Active Record
2. **Controller** (`controllers/novaEntidade.controller.js`) - Template Method
3. **Routes** (`routes/novaEntidade.routes.js`) - RESTful
4. **Validator** (`middlewares/validators/novaEntidade.validator.js`) - Validation Pipeline
5. **Service** (`frontend/services/novaEntidade.ts`) - Service Layer
6. **Components** (`frontend/components/novaEntidade/`) - Composite

Cada arquivo segue os padrões já estabelecidos, tornando o desenvolvimento mais rápido e consistente.

---

## 📖 Referências

- **Documentação Completa:** [DESIGN_PATTERNS.md](./DESIGN_PATTERNS.md)
- **README do Projeto:** [README.md](./README.md)
- **Gang of Four (GoF):** Design Patterns clássicos
- **React Patterns:** Padrões específicos do React
- **RESTful API Design:** Princípios REST

---

## 🏆 Conclusão

O projeto PI demonstra **excelência arquitetural** através da aplicação consistente de mais de 35 design patterns. Esta abordagem resulta em um código:

- 🎯 **Profissional** - Segue as melhores práticas da indústria
- 🔒 **Seguro** - Múltiplas camadas de validação e autenticação
- 📈 **Escalável** - Fácil adicionar novos recursos
- 🧪 **Testável** - Componentes isolados e mockáveis
- 📚 **Bem Documentado** - Swagger, TypeScript, JSDoc
- 🤝 **Manutenível** - Código organizado e consistente

**Para exemplos detalhados de código e explicações completas de cada padrão, consulte [DESIGN_PATTERNS.md](./DESIGN_PATTERNS.md).**
