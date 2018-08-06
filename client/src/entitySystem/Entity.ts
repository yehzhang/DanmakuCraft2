import {Phaser} from '../util/alias/phaser';
import {Component} from './alias';
import Coordinates from './component/Coordinates';

abstract class Entity implements Coordinates {
  abstract readonly coordinates: Phaser.ReadonlyPoint;

  static newBuilder(): EntityBuilder<Component> {
    return new EntityBuilder();
  }
}

export class EntityBuilder<T extends Component> {
  constructor(private readonly propertiesChain: object[] = []) {
  }

  mix<U extends Component>(component: U): EntityBuilder<T & U> {
    deepGetOwnPropertyDescriptorsAndAssign(this.propertiesChain, 0, component);
    return this as any;
  }

  build(): T {
    if (this.propertiesChain.length === 0) {
      throw new TypeError('No entity was mixed');
    }
    return deepCreate(this.propertiesChain);
  }
}

function checkIfPropertiesConflict(object: object, properties: object, other: object) {
  for (const descriptorName in properties) {
    if (other.hasOwnProperty(descriptorName) && descriptorName !== 'constructor') {
      throw new TypeError(`Component '${object.constructor.name}' has a conflicting field '${descriptorName}'`);
    }
  }
}

/**
 * {@param propertiesChain} must not be empty.
 */
function deepCreate(propertiesChain: object[]): any {
  return propertiesChain.reduceRight((prototype, properties: any) => {
    return Object.create(prototype, properties);
  }, ROOT_PROTOTYPE);
}

const ROOT_PROTOTYPE = Object.getPrototypeOf({});

function deepGetOwnPropertyDescriptorsAndAssign(
    propertiesChain: object[],
    propertiesChainIndex: number,
    object: object) {
  if (object === ROOT_PROTOTYPE) {
    return;
  }

  const properties = propertiesChain[propertiesChainIndex];
  const newProperties = Object.getOwnPropertyDescriptors(object);
  if (properties == null) {
    propertiesChain.push(newProperties);
  } else {
    checkIfPropertiesConflict(object, properties, newProperties);
    Object.assign(properties, newProperties);
  }

  deepGetOwnPropertyDescriptorsAndAssign(
      propertiesChain,
      propertiesChainIndex + 1,
      Object.getPrototypeOf(object));
}

export default Entity;
