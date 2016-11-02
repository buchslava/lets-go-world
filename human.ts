import * as _ from 'lodash';

const FIRST_WOMAN = 'Eva';
const FIRST_MAN = 'Adam';

export enum GENDER {
    MALE,
    FEMALE
}

export interface IHumanDescriptor {
      name: string;
      gender: GENDER
}

export class Human {
    private children: Array<Human> = [];

    constructor(
        private desc: IHumanDescriptor,
        private father?: Human,
        private mother?: Human) {
    }

    public create(): Human {
      if (this.desc.name !== FIRST_MAN && this.desc.name !== FIRST_WOMAN) {
        throw Error('This person can not be created! Use traditional approach!');
      }

      return this.validate();
    }

    public born(desc: IHumanDescriptor, father: Human): Human {
      const newHuman = new Human(desc, father, this).validate();

      this.children.push(newHuman);

      return newHuman;
    }

    private validate(): Human {
      const issuesTemplates: Array<Function> = [
          () => !this.desc ? 'wrong information' : null,
          () => this.father && this.father.desc.gender !== GENDER.MALE ? 'wrong father' : null,
          () => this.mother && this.mother.desc.gender !== GENDER.FEMALE ? 'wrong mother' : null,
          () => !this.desc.name ? 'empty name' : null
      ];

      const issues = issuesTemplates.map(issueFun => issueFun()).filter(issue => !!issue);

      if (!_.isEmpty(issues)) {
        throw Error(issues.toString());
      }

      return this;
    }
}
