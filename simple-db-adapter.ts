import { keys, head } from 'lodash';
import { readFile } from 'fs-extra';
import { Human, GENDER } from './human';
import { IDBAdapter } from './db-adapters';

export class SimpleDbAdapter implements IDBAdapter {
  read(filePath: string, onDBReady: (error, data) => void): void {
    readFile(filePath, 'utf8', (fileError, content) => {
      if (fileError) {
        onDBReady(fileError, null);
        return;
      }

      let source = null;

      try {
        source = JSON.parse(content).Family;
      } catch (jsonError) {
        onDBReady(jsonError, null);
        return;
      }

      const humans: Array<Human> = [];
      const fatherHash: any = {};
      const motherHash: any = {};

      keys(source).forEach(key => {
        const sourcePerson = source[key];
        const human = new Human({
          id: sourcePerson.id,
          name: sourcePerson.name,
          gender: sourcePerson.wife || sourcePerson.gender === 'm' ? GENDER.MALE : GENDER.FEMALE
        });

        if (sourcePerson.father) {
          fatherHash[sourcePerson.id] = sourcePerson.father;
        }

        if (sourcePerson.mother) {
          motherHash[sourcePerson.id] = sourcePerson.mother;
        }

        humans.push(human);
      });

      for (const human of humans) {
        human.setParents(
          head(humans.filter(h => h.getId() === fatherHash[human.getId()])),
          head(humans.filter(h => h.getId() === motherHash[human.getId()]))
        );
      }

      onDBReady(null, humans);
    });
  }
}
