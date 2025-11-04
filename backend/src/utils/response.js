// src/utils/response.js
export const ok = (res, data, meta) => {
  const payload = { sucesso: true, dados: data };
  if (meta) payload.meta = meta;
  return res.status(200).json(payload);
};

export const created = (res, data) => res.status(201).json({ sucesso: true, dados: data });

export const notFound = (res, message = 'Recurso não encontrado') =>
  res.status(404).json({ sucesso: false, mensagem: message });

export const badRequest = (res, message = 'Requisição inválida', errors) =>
  res.status(400).json({ sucesso: false, mensagem: message, errors });

