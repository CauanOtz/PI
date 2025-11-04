# 🎨 Design Patterns Utilizados no Projeto PI

Este documento descreve todos os padrões de design (design patterns) identificados no projeto de gestão da ONG Associação Nova Geração, tanto no backend (Node.js/Express) quanto no frontend (React/TypeScript).

---

## 📋 Índice

1. [Padrões do Backend](#padrões-do-backend)
2. [Padrões do Frontend](#padrões-do-frontend)
3. [Padrões Arquiteturais](#padrões-arquiteturais)
4. [Padrões de Integração](#padrões-de-integração)

---

## 🔧 Padrões do Backend

### 1. **MVC (Model-View-Controller)**
**Tipo:** Arquitetural  
**Localização:** Estrutura geral do backend  
**Descrição:** Separação clara entre modelos de dados, lógica de controle e apresentação.

**Exemplos:**
- **Model:** `backend/src/models/Usuario.model.js`, `backend/src/models/Aluno.model.js`
- **Controller:** `backend/src/controllers/usuario.controller.js`, `backend/src/controllers/aluno.controller.js`
- **Routes (Camada View):** `backend/src/routes/usuario.routes.js`, `backend/src/routes/aluno.routes.js`

```javascript
// Exemplo em usuario.controller.js
export const listarUsuarios = async (req, res, next) => {
  try {
    const { count, rows: usuarios } = await Usuario.findAndCountAll({...});
    res.status(200).json({ usuarios, total: count });
  } catch (error) {
    next(error);
  }
};
```

---

### 2. **Active Record**
**Tipo:** Padrão de Dados  
**Localização:** `backend/src/models/*.model.js`  
**Descrição:** Utilização do Sequelize ORM onde os modelos encapsulam tanto os dados quanto a lógica de acesso ao banco de dados.

**Exemplo:**
```javascript
// backend/src/models/Usuario.model.js
const Usuario = sequelize.define('Usuario', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING(100), allowNull: false },
  // ... outros campos
});

// Métodos de instância
Usuario.prototype.verificarSenha = function(senha) {
  return bcrypt.compareSync(senha, this.senha);
};

Usuario.prototype.gerarToken = function() {
  return jwt.sign({ id: this.id, email: this.email }, process.env.JWT_SECRET);
};
```

---

### 3. **Repository Pattern**
**Tipo:** Padrão de Dados  
**Localização:** Camada de modelos e controllers  
**Descrição:** Os controllers atuam como repositórios que abstraem o acesso aos dados através dos modelos Sequelize.

**Exemplo:**
```javascript
// backend/src/controllers/usuario.controller.js
export const buscarPorCPF = async (req, res, next) => {
  const usuario = await Usuario.findOne({
    where: { cpf: cpfFormatado },
    attributes: { exclude: ['senha'] }
  });
  // ...
};
```

---

### 4. **Singleton**
**Tipo:** Criacional  
**Localização:** `backend/src/config/database.js`, `backend/src/models/index.js`  
**Descrição:** A conexão do banco de dados (Sequelize) é criada uma única vez e reutilizada em toda a aplicação.

**Exemplo:**
```javascript
// backend/src/config/database.js
let sequelize;

if (databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {...});
} else if (dbDialect === 'sqlite') {
  sequelize = new Sequelize({...});
}

export { sequelize };
```

---

### 5. **Factory Pattern**
**Tipo:** Criacional  
**Localização:** `backend/src/models/index.js`  
**Descrição:** Inicialização e registro de todos os modelos de forma centralizada.

**Exemplo:**
```javascript
// backend/src/models/index.js
const models = {
  Aluno,
  Usuario,
  Documento,
  ResponsavelAluno,
  Notificacao,
  Presenca,
  Aula,
  UsuarioNotificacao,
};

Object.values(models).forEach(model => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});
```

---

### 6. **Middleware Pattern (Chain of Responsibility)**
**Tipo:** Comportamental  
**Localização:** `backend/src/middlewares/`, rotas  
**Descrição:** Requisições passam por uma cadeia de middlewares (autenticação, validação, etc.) antes de chegar ao controller.

**Exemplo:**
```javascript
// backend/src/routes/usuario.routes.js
router.put(
  '/:cpf',
  autenticar,                    // Middleware de autenticação
  validateAtualizarUsuario,      // Middleware de validação
  usuarioController.atualizarUsuarioPorCPF  // Controller
);

// backend/src/middlewares/auth.middleware.js
export const autenticar = async (req, res, next) => {
  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    req.usuario = await Usuario.findByPk(decoded.id);
    return next();  // Passa para o próximo middleware
  } catch (error) {
    return res.status(401).json({ mensagem: 'Token inválido' });
  }
};
```

---

### 7. **Decorator Pattern**
**Tipo:** Estrutural  
**Localização:** Modelos Sequelize  
**Descrição:** Uso de setters e getters para adicionar comportamento aos modelos (ex: hash de senha).

**Exemplo:**
```javascript
// backend/src/models/Usuario.model.js
const Usuario = sequelize.define('Usuario', {
  senha: { 
    type: DataTypes.STRING, 
    allowNull: false,
    set(value) {
      // Adiciona comportamento de hash automaticamente
      const hash = bcrypt.hashSync(value, 10);
      this.setDataValue('senha', hash);
    }
  }
});
```

---

### 8. **Strategy Pattern**
**Tipo:** Comportamental  
**Localização:** `backend/src/config/database.js`  
**Descrição:** Seleção dinâmica da estratégia de conexão ao banco (SQLite, PostgreSQL, MySQL) baseado em variáveis de ambiente.

**Exemplo:**
```javascript
// backend/src/config/database.js
if (databaseUrl) {
  sequelize = new Sequelize(databaseUrl, {...});      // Estratégia 1: URL
} else if (dbDialect === 'sqlite') {
  sequelize = new Sequelize({dialect: 'sqlite', ...}); // Estratégia 2: SQLite
} else {
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {...}); // Estratégia 3: Credenciais
}
```

---

### 9. **Observer Pattern**
**Tipo:** Comportamental  
**Localização:** Sistema de eventos do Express e associações Sequelize  
**Descrição:** Modelos podem observar mudanças e reagir através de hooks.

**Exemplo (conceitual):**
```javascript
// Associações em modelos criam observers implícitos
Usuario.associate = (models) => {
  Usuario.belongsToMany(models.Aluno, {
    through: models.ResponsavelAluno,
    foreignKey: 'id_usuario'
  });
};
```

---

### 10. **Adapter Pattern**
**Tipo:** Estrutural  
**Localização:** `backend/src/utils/cpf.js`, validadores  
**Descrição:** Adaptação de diferentes formatos de entrada (CPF com/sem máscara, telefone, etc.) para um formato padrão.

**Exemplo:**
```javascript
// backend/src/utils/cpf.js (inferido do uso em controllers)
export const normalizeCpf = (cpf) => {
  return cpf.toString().replace(/\D/g, ''); // Adapta para apenas dígitos
};

export const formatCpf = (cpfDigits) => {
  return cpfDigits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

// backend/src/controllers/usuario.controller.js
const cpfDigits = normalizeCpf(cpf);
const cpfFormatado = formatCpf(cpfDigits);
```

---

### 11. **Template Method**
**Tipo:** Comportamental  
**Localização:** Controllers  
**Descrição:** Controllers seguem um template comum: validação → busca/operação → resposta/erro.

**Exemplo:**
```javascript
// Todos os controllers seguem este template
export const operacao = async (req, res, next) => {
  try {
    // 1. Extrair e validar dados
    const { param } = req.body;
    
    // 2. Executar operação
    const resultado = await Model.operacao(param);
    
    // 3. Retornar resposta
    res.status(200).json(resultado);
  } catch (error) {
    // 4. Tratamento de erro
    next(error);
  }
};
```

---

### 12. **Dependency Injection**
**Tipo:** Arquitetural  
**Localização:** Rotas e middlewares  
**Descrição:** Injeção de dependências através de parâmetros nas rotas.

**Exemplo:**
```javascript
// backend/src/routes/usuario.routes.js
import * as usuarioController from '../controllers/usuario.controller.js';
import { autenticar } from '../middlewares/auth.middleware.js';

router.get('/me', autenticar, usuarioController.obterMeusDados);
// autenticar e obterMeusDados são injetados
```

---

## 🎨 Padrões do Frontend

### 13. **Provider Pattern (Context API)**
**Tipo:** Criacional/Comportamental  
**Localização:** `frontend/src/context/AuthProvider.tsx`  
**Descrição:** Compartilhamento de estado de autenticação globalmente sem prop drilling.

**Exemplo:**
```typescript
// frontend/src/context/AuthProvider.tsx
const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean>(isAuthenticated());
  const [user, setUser] = useState<User | null>(null);
  
  const value = useMemo<AuthCtx>(() => ({
    authed,
    user,
    login: async (email, password) => { /* ... */ },
    logout: () => { /* ... */ },
  }), [authed, user]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  return useContext(Ctx);
}
```

---

### 14. **Custom Hooks Pattern**
**Tipo:** Comportamental  
**Localização:** `frontend/src/hooks/useAsync.ts`, `frontend/src/context/AuthProvider.tsx`  
**Descrição:** Reutilização de lógica stateful entre componentes.

**Exemplo:**
```typescript
// frontend/src/hooks/useAsync.ts
export function useAsync<T>(asyncFn: (...args: any[]) => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async (...args: any[]) => {
    setLoading(true);
    try {
      const result = await asyncFn(...args);
      setData(result);
      return result;
    } catch (err: any) {
      setError(String(err.message));
      return null;
    } finally {
      setLoading(false);
    }
  }, [asyncFn]);

  return { data, loading, error, run, reset };
}
```

---

### 15. **Service Layer Pattern**
**Tipo:** Arquitetural  
**Localização:** `frontend/src/services/*.ts`  
**Descrição:** Camada de abstração para chamadas à API, separando lógica de negócio da UI.

**Exemplo:**
```typescript
// frontend/src/services/auth.ts
export async function login({ email, password }) {
  const res = await http.post<{ token: string; user?: any }>(
    "/usuarios/login",
    { email, senha: password }
  );
  tokenStorage.set(res.data.token);
  if (res.data.user) {
    userStorage.set(res.data.user);
  }
  return res.data;
}

export async function fetchMe() {
  const res = await http.get<any>("/usuarios/me");
  return res.data;
}
```

---

### 16. **Singleton (Storage)**
**Tipo:** Criacional  
**Localização:** `frontend/src/lib/storage.ts`  
**Descrição:** Acesso centralizado ao localStorage através de objetos únicos.

**Exemplo:**
```typescript
// frontend/src/lib/storage.ts (inferido do uso)
export const tokenStorage = {
  get: () => localStorage.getItem('token'),
  set: (token: string) => localStorage.setItem('token', token),
  clear: () => localStorage.removeItem('token')
};

export const userStorage = {
  get: () => JSON.parse(localStorage.getItem('user') || 'null'),
  set: (user: any) => localStorage.setItem('user', JSON.stringify(user)),
  clear: () => localStorage.removeItem('user')
};
```

---

### 17. **Interceptor Pattern**
**Tipo:** Comportamental  
**Localização:** `frontend/src/lib/http.ts`  
**Descrição:** Interceptação de requisições e respostas HTTP para adicionar comportamento (autenticação, tratamento de erros).

**Exemplo:**
```typescript
// frontend/src/lib/http.ts
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Request interceptor: adiciona token automaticamente
http.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: trata erros 401
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      tokenStorage.clear();
      // redirecionar para login
    }
    return Promise.reject(err);
  }
);
```

---

### 18. **Facade Pattern**
**Tipo:** Estrutural  
**Localização:** Services layer, `frontend/src/lib/errors.ts`, `frontend/src/lib/format.ts`  
**Descrição:** Interface simplificada para subsistemas complexos.

**Exemplo:**
```typescript
// frontend/src/lib/errors.ts (inferido)
export const extractErrorMessage = (err: any): string => {
  return err?.response?.data?.mensagem || 
         err?.message || 
         'Erro inesperado';
};

// frontend/src/lib/format.ts (inferido)
export const formatCPF = (cpf: string): string => {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export const formatDateTime = (date: string): string => {
  // Formatação simplificada de datas
};
```

---

### 19. **Composite Pattern**
**Tipo:** Estrutural  
**Localização:** Componentes React  
**Descrição:** Componentes podem conter outros componentes, formando árvores de componentes.

**Exemplo:**
```typescript
// Componentes UI compostos
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Título</DialogTitle>
    </DialogHeader>
    {children}
  </DialogContent>
</Dialog>
```

---

### 20. **Adapter Pattern (Normalização)**
**Tipo:** Estrutural  
**Localização:** Services  
**Descrição:** Adaptação de diferentes formatos de resposta do backend para um formato único usado pelo frontend.

**Exemplo (conceitual do README):**
```typescript
// frontend/src/services/notificacao.ts (inferido do README)
// "Normalização de estruturas de retorno para notificações 
// tolerando formatos diferentes do backend"

const normalizeNotification = (data: any) => {
  // Adapta diferentes estruturas de resposta
  return {
    id: data.id || data.notificationId,
    title: data.title || data.titulo,
    // ...
  };
};
```

---

### 21. **Container/Presentational Pattern**
**Tipo:** Arquitetural  
**Localização:** Componentes e telas  
**Descrição:** Separação entre componentes que gerenciam estado (containers) e componentes de apresentação (presentational).

**Exemplo:**
```typescript
// Container (screens/)
function UserScreen() {
  const { data, loading } = useAsync(fetchUsers);
  return <UserList users={data} loading={loading} />;
}

// Presentational (components/)
function UserList({ users, loading }: Props) {
  if (loading) return <Spinner />;
  return <div>{users.map(u => <UserCard user={u} />)}</div>;
}
```

---

### 22. **Higher-Order Component (HOC) - Implícito**
**Tipo:** Estrutural  
**Localização:** Rotas protegidas  
**Descrição:** Componentes que envolvem outros para adicionar funcionalidade (ex: verificação de autenticação).

**Exemplo (conceitual):**
```typescript
// Proteção de rotas (padrão comum em React Router)
function PrivateRoute({ children }) {
  const { authed } = useAuth();
  return authed ? children : <Navigate to="/login" />;
}
```

---

### 23. **Module Pattern**
**Tipo:** Estrutural  
**Localização:** `frontend/src/lib/index.ts`, `frontend/src/types/index.ts`  
**Descrição:** Uso de barrel exports para organizar e simplificar imports.

**Exemplo (do README):**
```typescript
// frontend/src/lib/index.ts
export * from './http';
export * from './storage';
export * from './format';
export * from './errors';

// Uso
import { http, formatCPF, extractErrorMessage } from '@/lib';
```

---

### 24. **Observer Pattern (React State)**
**Tipo:** Comportamental  
**Localização:** Hooks useState, useEffect  
**Descrição:** Componentes observam mudanças de estado e re-renderizam automaticamente.

**Exemplo:**
```typescript
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    // Observa mudanças em count
    console.log('Count changed:', count);
  }, [count]);
  
  return <button onClick={() => setCount(count + 1)}>Increment</button>;
}
```

---

### 25. **Factory Pattern (Component Factory)**
**Tipo:** Criacional  
**Localização:** Components UI (inferido)  
**Descrição:** Criação de componentes baseados em props ou condições.

**Exemplo:**
```typescript
// frontend/src/components/ui/StatusBadge.tsx (inferido)
function StatusBadge({ status }: { status: 'ativa' | 'expirada' }) {
  const variants = {
    ativa: 'bg-green-500',
    expirada: 'bg-red-500'
  };
  
  return <Badge className={variants[status]}>{status}</Badge>;
}
```

---

## 🏗️ Padrões Arquiteturais

### 26. **Layered Architecture (Arquitetura em Camadas)**
**Tipo:** Arquitetural  
**Descrição:** Backend organizado em camadas distintas (Routes → Middlewares → Controllers → Models → Database).

**Estrutura:**
```
┌─────────────────────┐
│     Routes          │ ← Definição de endpoints
├─────────────────────┤
│    Middlewares      │ ← Validação, autenticação
├─────────────────────┤
│    Controllers      │ ← Lógica de negócio
├─────────────────────┤
│      Models         │ ← Acesso a dados
├─────────────────────┤
│     Database        │ ← Persistência
└─────────────────────┘
```

---

### 27. **RESTful API Architecture**
**Tipo:** Arquitetural  
**Descrição:** API segue os princípios REST com recursos e métodos HTTP apropriados.

**Exemplo:**
```javascript
// backend/src/routes/usuario.routes.js
GET    /api/v2/usuarios       → listar usuários
POST   /api/v2/usuarios       → criar usuário
GET    /api/v2/usuarios/:cpf  → buscar por CPF
PUT    /api/v2/usuarios/:cpf  → atualizar
DELETE /api/v2/usuarios/:cpf  → excluir
```

---

### 28. **Monorepo Pattern**
**Tipo:** Arquitetural  
**Descrição:** Frontend e backend no mesmo repositório, mas estruturalmente separados.

**Estrutura:**
```
PI/
├── backend/
│   ├── src/
│   ├── migrations/
│   └── package.json
├── frontend/
│   ├── src/
│   └── package.json
└── docker-compose.yml
```

---

### 29. **Environment Configuration Pattern**
**Tipo:** Arquitetural  
**Localização:** `.env`, `process.env`, `import.meta.env`  
**Descrição:** Configurações sensíveis e específicas de ambiente externalizadas.

**Exemplo:**
```javascript
// Backend
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';
const PORT = process.env.PORT || 3000;

// Frontend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

---

## 🔗 Padrões de Integração

### 30. **API Gateway Pattern**
**Tipo:** Integração  
**Localização:** `backend/src/app.js`  
**Descrição:** Ponto único de entrada para todas as APIs, roteando para diferentes módulos.

**Exemplo:**
```javascript
// backend/src/app.js
app.use('/api/v2/aulas', aulaRoutes);
app.use('/api/v2/usuarios', usuarioRoutes);
app.use('/api/v2/alunos', alunoRoutes);
app.use('/api/v2/presencas', presencaRoutes);
app.use('/api/v2/notificacoes', notificacaoRoutes);
```

---

### 31. **DTO (Data Transfer Object)**
**Tipo:** Estrutural  
**Localização:** TypeScript types, validadores  
**Descrição:** Objetos para transferência de dados entre frontend e backend com validação.

**Exemplo:**
```typescript
// frontend/src/types/notifications.ts
export interface Notification {
  id: number;
  titulo: string;
  mensagem: string;
  dataExpiracao: string;
  ativa: boolean;
}
```

---

### 32. **Validation Pipeline Pattern**
**Tipo:** Comportamental  
**Localização:** `backend/src/middlewares/validators/*.validator.js`  
**Descrição:** Validação de dados em pipeline antes do processamento.

**Exemplo:**
```javascript
// backend/src/middlewares/validators/usuario.validator.js
export const validateRegistroUsuario = [
  body('nome').trim().notEmpty().isLength({ min: 3, max: 100 }),
  body('email').trim().notEmpty().isEmail().normalizeEmail(),
  body('senha').notEmpty().isLength({ min: 6 }),
  body('cpf').custom(validarCPF),
  // Middleware para processar resultados
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];
```

---

### 33. **Pagination Pattern**
**Tipo:** Comportamental  
**Localização:** Controllers de listagem  
**Descrição:** Implementação de paginação para grandes conjuntos de dados.

**Exemplo:**
```javascript
// backend/src/controllers/usuario.controller.js
export const listarUsuarios = async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;
  
  const { count, rows } = await Usuario.findAndCountAll({
    offset,
    limit,
    order: [['nome', 'ASC']]
  });

  res.json({
    usuarios: rows,
    total: count,
    page: parseInt(page),
    totalPages: Math.ceil(count / limit),
    hasNext: page < Math.ceil(count / limit),
    hasPrevious: page > 1
  });
};
```

---

### 34. **Error Handling Pattern**
**Tipo:** Comportamental  
**Localização:** Middleware de erro global, try-catch em controllers  
**Descrição:** Tratamento centralizado de erros.

**Exemplo:**
```javascript
// backend/src/app.js
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Erro interno do servidor';
  res.status(statusCode).json({ 
    message, 
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) 
  });
});
```

---

### 35. **API Documentation Pattern (OpenAPI/Swagger)**
**Tipo:** Documentação  
**Localização:** `backend/src/config/swagger.js`  
**Descrição:** Documentação automática da API através de anotações JSDoc.

**Exemplo:**
```javascript
// backend/src/config/swagger.js
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API do Diario de Classe',
      version: '2.0.0',
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js', './src/models/*.js'],
};

// Controllers com anotações
/**
 * @openapi
 * /usuarios:
 *   get:
 *     summary: Lista todos os usuários
 *     tags: [Usuários]
 *     ...
 */
```

---

## 📊 Resumo por Categoria

### Padrões Criacionais (Criational)
1. Singleton (Database, Storage)
2. Factory (Models initialization, Component Factory)
3. Provider (Context API)

### Padrões Estruturais (Structural)
4. MVC
5. Adapter (CPF normalization, Response normalization)
6. Decorator (Model setters/getters)
7. Facade (Service layer, Utility functions)
8. Composite (React components)
9. Module (Barrel exports)

### Padrões Comportamentais (Behavioral)
10. Middleware/Chain of Responsibility
11. Strategy (Database connection)
12. Observer (Sequelize hooks, React state)
13. Template Method (Controller pattern)
14. Interceptor (HTTP interceptors)
15. Custom Hooks
16. Validation Pipeline

### Padrões Arquiteturais
17. Layered Architecture
18. RESTful API
19. Monorepo
20. Environment Configuration
21. Service Layer
22. Container/Presentational
23. Active Record
24. Repository

### Padrões de Integração
25. API Gateway
26. DTO (Data Transfer Objects)
27. Pagination
28. Error Handling
29. Dependency Injection

### Padrões de Documentação
30. OpenAPI/Swagger Documentation

---

## 🎯 Conclusão

Este projeto demonstra uma arquitetura robusta e bem estruturada, utilizando mais de **35 design patterns** diferentes. A combinação de padrões clássicos (MVC, Singleton, Factory, Observer) com padrões modernos de React (Hooks, Context API, Service Layer) e práticas recomendadas (RESTful, OpenAPI, Layered Architecture) resulta em um código:

- ✅ **Manutenível**: Separação clara de responsabilidades
- ✅ **Escalável**: Fácil adicionar novos recursos
- ✅ **Testável**: Componentes e serviços isolados
- ✅ **Documentado**: Swagger/OpenAPI para API
- ✅ **Seguro**: Autenticação JWT, validação de dados
- ✅ **Consistente**: Padrões aplicados uniformemente

---

**Nota:** Este documento foi criado através de análise estática do código-fonte. Alguns padrões podem estar implementados de forma parcial ou adaptada conforme as necessidades específicas do projeto.
