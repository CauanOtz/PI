# 🌟 Projeto de Gestão para a ONG Associação Nova Geração

## 📌 Sobre o Projeto
Este projeto tem como objetivo melhorar a administração dos registros da **Associação Nova Geração**, uma ONG localizada no **Jardim Refúgio, zona sul de Sorocaba-SP**.

A solução busca **facilitar o gerenciamento de informações** sobre os alunos, registro de presenças, faltas e demais atividades administrativas, proporcionando um ambiente mais organizado e eficiente.

---

## 🏡 Sobre a Associação Nova Geração
A **Associação Nova Geração** foi fundada em **27 de setembro de 2010** por **Liliane Cristine da Cruz Oliveira**, conhecida como *Lili*. O projeto teve início no corredor de uma pequena casa de bairro.

### 🎯 Nossa Missão
Prestar **serviços sociais, culturais e educacionais**, auxiliando **crianças e adolescentes de 4 a 17 anos**. Nosso trabalho conscientiza sobre temas como:
- ✅ Combate às drogas
- ✅ Cidadania
- ✅ Comportamento
- ✅ Meio ambiente
- ✅ Saúde e higiene pessoal

### 🌍 Nossa Visão
Construir uma **sociedade mais justa e digna**, trabalhando **em conjunto com pais e voluntários** para transformar o futuro e formar uma **Nova Geração**.

---

## 🛠️ Funcionalidades do Sistema
- 📌 **Cadastro de Alunos**: Registro detalhado dos participantes do projeto.
- 📌 **Gestão de Frequência**: Controle de presenças e faltas.
- 📌 **Organização de Aulas**: Cadastro e gestão das aulas realizadas pela ONG.
- 📌 **Relatórios e Estatísticas**: Geração de relatórios sobre frequência e participação dos alunos.
- 📌 **Acesso de Voluntários**: Controle de permissões e gerenciamento de perfis dos colaboradores.

---

## 💻 Tecnologias Utilizadas
- 🚀 **Back-end**: Node.js
- 🚀 **Front-end**: Typescript
- 🚀 **Outras ferramentas**: Font Awesome, SweetAlert

---

## 🔧 Melhorias Técnicas Recentes (Padronização & Qualidade)

Esta seção documenta as melhorias aplicadas recentemente ao código para aumentar consistência, testabilidade e manutenção futura.

### 1. Qualidade e Estilo
- Adição de ESLint + Prettier + EditorConfig.
- Inclusão de Husky + lint-staged para impedir commits fora do padrão.
- Limpeza de imports/variáveis não utilizados em múltiplos componentes (reduz ruído de análise e build time).

### 2. Tipagem & Reutilização
- Criação de tipos centralizados de notificações (`src/types/notifications.ts`).
- Barrels em `src/lib/index.ts` e `src/types/index.ts` para simplificar imports.
- Normalização de estruturas de retorno para notificações (admin e responsável) tolerando formatos diferentes do backend.

### 3. Serviços Unificados
- `notificacaoService` com métodos: list/listMinhas/listByCpf/update/enviar/delete/markAsRead.
- `dashboardService` criado com fallback para endpoints alternativos sem replicar lógica na UI.
- Helpers para extração de arrays e contagem total em respostas heterogêneas.

### 4. Utilitários e Hooks
- `format.ts`: funções como `formatCPF`, `digitsOnly`, `formatDateTime`, `truncate`, `toBoolean`.
- `errors.ts`: `extractErrorMessage` consolidando leitura segura de mensagens (Axios/plain/Error).
- Hook `useAsync` para padronizar estado de carregamento/erro em ações isoladas.

### 5. UI / Componentização
- Refatoração de tela de administração de notificações: inline edit, seleção de destinatários com contagem, modal de confirmação de exclusão.
- Componente `StatusBadge` para estados de notificação (ativa/expirada) centralizado.
- Organização visual coerente com demais telas (cards, espaçamentos, tipografia).

### 6. Testes
- Configuração do Vitest + Testing Library (JSDOM) em `vitest.config.ts`.
- Teste inicial para utilitários de formatação (`src/__tests__/format.test.ts`).
- Ajustes no `tsconfig.app.json` para suportar types Node e build incremental.

### 7. Build & Type Safety
- Remoção de opções TypeScript não suportadas (`noUncheckedSideEffectImports`).
- Ajustes para eliminar todos os erros de tipo (imports e variáveis não usados, parâmetros renomeados com prefixo `_`).

### 8. Preparação para Futuro
- Scaffold de i18n em `src/i18n/messages.ts` (mensagens agrupadas por domínio).
- Comentários explicativos onde há fallbacks (ex: `dashboardService`, normalização de notificações) para revisão futura após estabilização de endpoints.

### 9. Scripts Novos / Ajustados
| Script | Função |
| ------ | ------ |
| `dev` | Vite dev server |
| `build` | Build produção |
| `lint` | Verificação ESLint |
| `lint:fix` | Correção automática |
| `check` | Lint + Typecheck |
| `test` | Testes (Vitest run) |
| `test:ui` | Testes modo interativo |

### 10. Próximos Passos Recomendados
1. Extrair tela de notificações admin em subcomponentes (`NotificationEditor`, `NotificationsTable`).
2. Ampliar cobertura de testes (serviços, hooks e componentes críticos).
3. Adicionar paginação verdadeira para listagens longas (notificações, usuários, relatórios).
4. Integrar i18n real (ex: i18next) reaproveitando `messages.ts`.
5. Validar respostas críticas com `zod` (schema runtime).
6. Adicionar seeds de dados para ambiente local/homologação.
