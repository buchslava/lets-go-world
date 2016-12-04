import { flattenDeep } from 'lodash';
import { parallel } from 'async';
import { IDBAdapter, dbAdapters } from './db-adapters';

export class HumansReader {
  private configPath;

  constructor(configPath: string) {
    this.configPath = configPath;
  }

  read(onHumansReady: (error, content) => void) {
    const config = require(this.configPath);
    const dbActions: Array<any> = config.items.map(item => onDBFileReady => {
      const adapter: IDBAdapter = new dbAdapters[item.adapter]();

      adapter.read(item.filePath, onDBFileReady);
    });

    parallel(dbActions, (error, result) => {
      if (error) {
        onHumansReady(error, null);
        return;
      }

      const humans = flattenDeep(result);

      onHumansReady(null, humans);
    });
  }
}
