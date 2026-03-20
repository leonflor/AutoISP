import type { ERPAdapter, ERPAdapterConfig } from './types';
import { IXCSoftAdapter } from './adapters/ixcsoft';

export function getAdapter(erpType: string, config: ERPAdapterConfig): ERPAdapter {
  switch (erpType) {
    case 'ixcsoft':
    case 'ixc':
      return new IXCSoftAdapter(config);
    default:
      throw new Error(`ERP '${erpType}' não implementado`);
  }
}
