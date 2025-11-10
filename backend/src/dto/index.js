// src/dto/index.js
export { default as UsuarioDTO } from './UsuarioDTO.js';
export { default as AssistidoDTO } from './AssistidoDTO.js';
export { default as DocumentoDTO } from './DocumentoDTO.js';
export { default as AulaDTO } from './AulaDTO.js';
export { default as AtividadeDTO } from './AtividadeDTO.js';
export { default as PresencaDTO } from './PresencaDTO.js';
export { default as NotificacaoDTO } from './NotificacaoDTO.js';
export { default as PaginationDTO } from './PaginationDTO.js';

// Pequeno helper para mapear listas
export const mapList = (arr, fn) => (Array.isArray(arr) ? arr.map(fn) : []);

