import { VipDbAdapter } from './vip-db-adapter';
import { SimpleDbAdapter } from './simple-db-adapter';

export interface IDBAdapter {
  read(filePath: string, onDBReady: (error, data) => void): void;
}

export const dbAdapters: any = {
  VipDbAdapter,
  SimpleDbAdapter
}
