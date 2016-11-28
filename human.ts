import * as _ from 'lodash';

export enum GENDER {
  MALE,
  FEMALE
}

export interface IHumanDescriptor {
  id: string;
  name: string;
  gender: GENDER
}

export class Human {
  private children: Array<Human> = [];
  private father: Human;
  private mother: Human;

  constructor(private desc: IHumanDescriptor) {
  }

  public getId() {
    return this.desc.id;
  }

  public setParents(father: Human, mother: Human) {
    this.father = father;
    this.mother = mother;

    if (this.father) {
      this.father.children.push(this);
    }

    if (this.mother) {
      this.mother.children.push(this);
    }
  }
}
