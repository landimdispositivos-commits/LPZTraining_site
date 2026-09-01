import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ArquivoParaSalvar, StorageAdapter } from "./storage-adapter";

// content-type real do arquivo (nunca a extensão enviada pelo usuário) define
// a extensão gravada em disco.
const EXTENSOES_PERMITIDAS: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export const TAMANHO_MAXIMO_BYTES = 8 * 1024 * 1024; // 8 MB

export class LocalDiskStorage implements StorageAdapter {
  constructor(
    private readonly diretorioBase: string,
    private readonly urlBase: string
  ) {}

  async salvar(arquivo: ArquivoParaSalvar): Promise<{ caminho: string }> {
    const extensao = EXTENSOES_PERMITIDAS[arquivo.contentType];
    if (!extensao) {
      throw new Error(`Tipo de arquivo não permitido: ${arquivo.contentType}`);
    }
    if (arquivo.conteudo.byteLength > TAMANHO_MAXIMO_BYTES) {
      throw new Error("Arquivo excede o tamanho máximo permitido.");
    }

    await mkdir(this.diretorioBase, { recursive: true });

    // Nome sempre gerado pelo servidor — nunca usar `arquivo.nomeOriginal` no
    // caminho: é a forma clássica de path traversal / RCE via upload.
    const nomeArquivo = `${randomUUID()}${extensao}`;
    const caminhoAbsoluto = path.join(this.diretorioBase, nomeArquivo);

    await writeFile(caminhoAbsoluto, arquivo.conteudo, { mode: 0o644 });

    return { caminho: nomeArquivo };
  }

  obterUrl(caminho: string): string {
    return `${this.urlBase}/${caminho}`;
  }

  async remover(caminho: string): Promise<void> {
    await unlink(path.join(this.diretorioBase, caminho));
  }
}
