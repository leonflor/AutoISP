// ═══ CAMADA 3 — Registry de Providers ═══

import type { ErpProvider, ErpProviderDriver } from "../erp-types.ts";
import { ixcProvider } from "./ixc.ts";
import { sgpProvider } from "./sgp.ts";
import { mkProvider } from "./mk.ts";

const providers: Record<string, ErpProviderDriver> = {
  ixc: ixcProvider,
  sgp: sgpProvider,
  mk_solutions: mkProvider,
};

/**
 * Retorna o driver do provider. Lança erro se desconhecido.
 * Para adicionar um novo ERP: criar arquivo, importar e registrar aqui.
 */
export function getProvider(name: ErpProvider): ErpProviderDriver {
  const provider = providers[name];
  if (!provider) {
    throw new Error(`Provider ERP desconhecido: ${name}`);
  }
  return provider;
}
