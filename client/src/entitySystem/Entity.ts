import {Component} from './alias';
import Coordinates from './component/Coordinates';

abstract class Entity extends Coordinates {
  static newBuilder<T extends Component = {}>(): EntityBuilder<T> {
    return new EntityBuilder();
  }
}

export default Entity;

export class EntityBuilder<T extends Component> {
  private static readonly ROOT_PROTOTYPE = Object.getPrototypeOf({});

  constructor(private propertiesChain: object[] = []) {
  }

  private static checkIfPropertiesConflict(object: object, properties: object, other: object) {
    for (let descriptorName in properties) {
      if (other.hasOwnProperty(descriptorName) && descriptorName !== 'constructor') {
        throw new TypeError(`Component '${object.constructor.name}' has a conflicting field '${descriptorName}'`);
      }
    }
  }

  private static deepGetOwnPropertyDescriptorsAndAssign(
      propertiesChain: object[],
      propertiesChainIndex: number,
      object: object) {
    if (object === this.ROOT_PROTOTYPE) {
      return;
    }

    let properties = propertiesChain[propertiesChainIndex];
    let newProperties = Object.getOwnPropertyDescriptors(object);
    if (properties === undefined) {
      propertiesChain.push(newProperties);
    } else {
      this.checkIfPropertiesConflict(object, properties, newProperties);
      Object.assign(properties, newProperties);
    }

    this.deepGetOwnPropertyDescriptorsAndAssign(
        propertiesChain,
        propertiesChainIndex + 1,
        Object.getPrototypeOf(object));
  }

  /**
   * {@param propertiesChain} must not be empty.
   */
  private static deepCreate(propertiesChain: object[]): any {
    return propertiesChain.reduceRight((prototype, properties: any) => {
      return Object.create(prototype, properties);
    }, this.ROOT_PROTOTYPE);
  }

  mix<U extends Component>(component: U): EntityBuilder<T & U> {
    EntityBuilder.deepGetOwnPropertyDescriptorsAndAssign(this.propertiesChain, 0, component);
    return this as any;
  }

  build(): T {
    if (this.propertiesChain.length === 0) {
      throw new TypeError('No entity was mixed');
    }
    return EntityBuilder.deepCreate(this.propertiesChain);
  }
}
