let memoryToken: string | null = null;

export const tokenStorage = {
  get() {
    try {
      const localToken = localStorage.getItem("auth_token");
      console.log('Token em memória:', !!memoryToken);
      console.log('Token no localStorage:', !!localToken);
      return memoryToken ?? localToken;
    } catch (err) {
      console.error('Erro ao ler token:', err);
      return null;
    }
  },
  set(token: string | null) {
    try {
      console.log('Tentando salvar token:', !!token);
      memoryToken = token;
      if (token) {
        localStorage.setItem("auth_token", token);
        console.log('Token salvo com sucesso');
      } else {
        localStorage.removeItem("auth_token");
        console.log('Token removido');
      }
    } catch (err) {
      console.error('Erro ao salvar token:', err);
    }
  },
  clear() {
    try {
      console.log('Limpando token...');
      memoryToken = null;
      localStorage.removeItem("auth_token");
      console.log('Token limpo com sucesso');
    } catch (err) {
      console.error('Erro ao limpar token:', err);
    }
  },
};

let memoryUser: any | null = null;

export const userStorage = {
  get() {
    try {
      if (memoryUser) return memoryUser;
      const userStr = localStorage.getItem("auth_user");
      console.log('Dados do usuário no localStorage:', !!userStr);
      return userStr ? JSON.parse(userStr) : null;
    } catch (err) {
      console.error('Erro ao ler dados do usuário:', err);
      return null;
    }
  },
  set(user: any | null) {
    try {
      console.log('Tentando salvar dados do usuário:', !!user);
      memoryUser = user;
      if (user) {
        localStorage.setItem("auth_user", JSON.stringify(user));
        console.log('Dados do usuário salvos com sucesso');
      } else {
        localStorage.removeItem("auth_user");
        console.log('Dados do usuário removidos');
      }
    } catch (err) {
      console.error('Erro ao salvar dados do usuário:', err);
    }
  },
  clear() {
    try {
      console.log('Limpando dados do usuário...');
      memoryUser = null;
      localStorage.removeItem("auth_user");
      console.log('Dados do usuário limpos com sucesso');
    } catch (err) {
      console.error('Erro ao limpar dados do usuário:', err);
    }
  },
};