import { http } from "../lib/http";
import { tokenStorage, userStorage } from "../lib/storage";

export async function login({ email, password }: { email: string; password: string }) {
  console.log('Iniciando login...');
  try {
    const res = await http.post<{ sucesso: boolean; dados: { usuario: any; token: string } }>(
      "/usuarios/login",
      { email, senha: password }
    );

    console.log('Resposta do servidor:', res.data);

    if (!res.data || !res.data.sucesso || !res.data.dados) {
      console.error('Resposta inválida do servidor');
      throw new Error('Resposta inválida do servidor');
    }

    const { usuario, token } = res.data.dados;

    if (!token) {
      console.error('Token não encontrado na resposta');
      throw new Error('Token não recebido');
    }

    console.log('Token recebido:', !!token);
    console.log('Usuário recebido:', !!usuario);

    tokenStorage.set(token);
    if (usuario) {
      userStorage.set(usuario);
    }

    const savedToken = tokenStorage.get();
    console.log('Token salvo com sucesso:', !!savedToken);

    return { token, user: usuario };
  } catch (error) {
    console.error('Erro durante o login:', error);
    throw error;
  }
}

export async function fetchMe() {
  const res = await http.get<{ sucesso: boolean; dados: any }>("/usuarios/me");
  console.log('Resposta do /me:', res.data);
  
  if (!res.data || !res.data.sucesso) {
    console.error('Resposta inválida do /me');
    throw new Error('Não foi possível obter os dados do usuário');
  }

  const user = res.data.dados;
  if (user) {
    console.log('Salvando dados do usuário do /me');
    userStorage.set(user);
  }
  return user;
}

export function logout() {
  tokenStorage.clear();
  userStorage.clear();
}

export function isAuthenticated() {
  return !!tokenStorage.get();
}

export function getUser() {
  return userStorage.get();
}