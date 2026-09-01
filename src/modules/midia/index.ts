import { LocalDiskStorage } from "./local-disk-storage";
import type { StorageAdapter } from "./storage-adapter";

// Diretório servido pela rota /uploads (ver src/app/uploads/[...caminho]) —
// nunca aponte um servidor de arquivos estático genérico direto pra cá, para
// manter controle sobre content-type e permitir trocar de adapter depois.
const diretorioBase = process.env.UPLOADS_DIR ?? "./uploads";
const urlBase = "/uploads";

export const storageAdapter: StorageAdapter = new LocalDiskStorage(diretorioBase, urlBase);
export type { StorageAdapter, ArquivoParaSalvar } from "./storage-adapter";
