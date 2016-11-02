import * as fs from 'fs-extra';
import * as _ from 'lodash';
import { parseString } from 'xml2js';
import { Human, GENDER } from './human';

/*const adam = new Human({
    name: `Adam`,
    gender: GENDER.MALE
  }, null, null).create();
const eva = new Human({
    name: `Eva`,
    gender: GENDER.FEMALE
  }, null, null).create();
const cain = eva.born({
  name: `Cain`,
  gender: GENDER.MALE
}, adam);
const cainWife = eva.born({
  name: `Cain's wife`,
  gender: GENDER.FEMALE
}, adam);
const abel = eva.born({
  name: `Abel`,
  gender: GENDER.MALE
}, adam);
const seth = eva.born({
  name: `Seth`,
  gender: GENDER.MALE
}, adam);
const sethWife = eva.born({
  name: `Seth's wife`,
  gender: GENDER.FEMALE
}, adam);*/


interface ITempPerson {
  id: string;
  refn: string;
  name: string;
  sex: string;
  birthDate?: string;
  birthPlace?: string;
  deathDate?: string;
  deathPlace?: string;
  parentFamilyId?: string;
  ownFamilyIds?: Array<string>;
}

const persons: Array<ITempPerson> = [];

fs.readFile('./data/Kennedy.xml', 'utf8', (err, content) => {
  parseString(content, (err, result) => {
      result.GED.INDI.forEach(personTag => {
        const id: string = personTag.$.ID;
        const refn:string = !_.isEmpty(personTag.REFN) ? _.head(personTag.REFN).toString() : null;
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

        persons.push({
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
        });
      });
  });

  console.log(persons);
});

