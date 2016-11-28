import * as fs from 'fs-extra';
import * as _ from 'lodash';
import { parseString } from 'xml2js';
import { Human, GENDER } from './human';

interface ISourcePerson {
  id: string;
  refn: string;
  name: string;
  sex: string;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  parentFamilyId?: string;
  ownFamilyIds: Array<string>;
}

interface ISourceFamily {
  id: string,
  husbandId: string,
  wifeId: string,
  children: Array<string>
}

fs.readFile('./data/Kennedy.xml', 'utf8', (err, content) => {
  parseString(content, (err, result) => {
    // do it as hash -> reduce
    const sourcePersons: Array<ISourcePerson> = result.GED.INDI.map(personTag => {
      const id: string = personTag.$.ID;
      const refn: string = !_.isEmpty(personTag.REFN) ? _.head(personTag.REFN).toString() : null;
      const name: string = !_.isEmpty(personTag.NAME) ? _.head(personTag.NAME).toString() : null;
      const sex: string = !_.isEmpty(personTag.SEX) ? _.head(personTag.SEX).toString() : null;
      const birth: any = _.head(personTag.BIRT);
      const birthDate: string = birth && birth.DATE ? _.head(birth.DATE).toString() : null;
      const birthPlace: string = birth && birth.PLAC ? _.head(birth.PLAC).toString() : null;
      const death: any = _.head(personTag.DEAT);
      const deathDate: string = death && death.DATE ? _.head(death.DATE).toString() : null;
      const deathPlace: string = death && death.PLAC ? _.head(death.PLAC).toString() : null;
      const parentFamily: any = _.head(personTag.FAMC);
      const parentFamilyId: string = parentFamily ? parentFamily.$.REF : null;
      const ownFamilies: Array<any> = personTag.FAMS;

      let ownFamilyIds = [];

      if (!_.isEmpty(ownFamilies)) {
        ownFamilyIds = ownFamilies.map(ownFamily => ownFamily.$.REF);
      }

      return {
        id,
        refn,
        name,
        sex,
        birthDate,
        birthPlace,
        deathDate,
        deathPlace,
        parentFamilyId,
        ownFamilyIds
      };
    });

    const sourceFamilies: Array<ISourceFamily> = result.GED.FAM.map(family => {
      const id = family.$.ID;
      const husbandId = family.HUSB[0].$.REF;
      const wifeId = family.WIFE[0].$.REF;
      const children = (family.CHIL || []).map(child => child.$.REF);

      return {
        id,
        husbandId,
        wifeId,
        children
      };
    });

    //console.log(sourcePersons);
    //console.log(sourceFamilies);

    const humans: Array<Human> = [];

    sourcePersons.forEach(sourcePerson => {
      const human = new Human({
        id: sourcePerson.id,
        name: sourcePerson.name,
        gender: sourcePerson.sex === 'M' ? GENDER.MALE : GENDER.FEMALE
      });

      humans.push(human);
    });

    for (const human of humans) {
      const family = _.head(sourceFamilies.filter(sourceFamily => _.includes(sourceFamily.children, human.getId())));

      if (family) {
        human.setParents(
          _.head(humans.filter(human => human.getId() === family.husbandId)),
          _.head(humans.filter(human => human.getId() === family.wifeId))
        );
      }
    }

    console.log(humans);
  });
});
