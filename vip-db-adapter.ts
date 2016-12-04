import { readFile } from 'fs-extra';
import { isEmpty, head, includes } from 'lodash';
import { parseString } from 'xml2js';
import { Human, GENDER } from './human';
import { IDBAdapter } from './db-adapters';

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

export class VipDbAdapter implements IDBAdapter {
    read(filePath: string, onDBReady: (error, data) => void): void {
        readFile(filePath, 'utf8', (err, content) => {
            if (err) {
                onDBReady(err, null);
                return;
            }

            parseString(content, (err, result) => {
                const sourcePersons: Array<ISourcePerson> = result.GED.INDI.map(personTag => {
                    const id: string = personTag.$.ID;
                    const refn: string = !isEmpty(personTag.REFN) ? head(personTag.REFN).toString() : null;
                    const name: string = !isEmpty(personTag.NAME) ? head(personTag.NAME).toString() : null;
                    const sex: string = !isEmpty(personTag.SEX) ? head(personTag.SEX).toString() : null;
                    const birth: any = head(personTag.BIRT);
                    const birthDate: string = birth && birth.DATE ? head(birth.DATE).toString() : null;
                    const birthPlace: string = birth && birth.PLAC ? head(birth.PLAC).toString() : null;
                    const death: any = head(personTag.DEAT);
                    const deathDate: string = death && death.DATE ? head(death.DATE).toString() : null;
                    const deathPlace: string = death && death.PLAC ? head(death.PLAC).toString() : null;
                    const parentFamily: any = head(personTag.FAMC);
                    const parentFamilyId: string = parentFamily ? parentFamily.$.REF : null;
                    const ownFamilies: Array<any> = personTag.FAMS;

                    let ownFamilyIds = [];

                    if (!isEmpty(ownFamilies)) {
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
                    const family = head(sourceFamilies.filter(sourceFamily => includes(sourceFamily.children, human.getId())));

                    if (family) {
                        human.setParents(
                            head(humans.filter(human => human.getId() === family.husbandId)),
                            head(humans.filter(human => human.getId() === family.wifeId))
                        );
                    }
                }

                onDBReady(null, humans);
            });
        });
    }
}
