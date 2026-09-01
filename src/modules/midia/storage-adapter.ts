// Porta (interface) de armazenamento de arquivos. Hoje só fotos usam isso —
// vídeos são embed do YouTube e não passam por aqui. Trocar para R2/S3 no
// futuro significa só escrever outro adapter, sem tocar em `modules/midia`.

export interface ArquivoParaSalvar {
  nomeOriginal: string;
  conteudo: Buffer;
  contentType: string;
}

export interface StorageAdapter {
  // Retorna um caminho relativo opaco (nunca deriva do nome original enviado
  // pelo usuário) para ser persistido em `midia.referencia`.
  salvar(arquivo: ArquivoParaSalvar): Promise<{ caminho: string }>;
  obterUrl(caminho: string): string;
  remover(caminho: string): Promise<void>;
}
