import { VipDbAdapter } from './vip-db-adapter';

export interface IDBAdapter {
  read(filePath: string, onDBReady: (error, data) => void): void;
}

export const dbAdapters: any = {
  VipDbAdapter
}
