import {Component} from './alias';
import Coordinates from './component/Coordinates';

abstract class Entity extends Coordinates {
  static newBuilder<T extends Entity = any>() {
    return new EntityBuilder<T, {}>({});
  }
}

export default Entity;

export class EntityBuilder<T extends Entity, U extends Component> {
  private entityPrototype: object;
  private entityProperties: PropertyDescriptorMap & ThisType<T>;

  constructor(entity: U) {
    this.entityPrototype =
        EntityBuilder.extendPrototypeFromComponent({}, Object.getPrototypeOf(entity));
    this.entityProperties = Object.getOwnPropertyDescriptors(entity);
  }

  private static checkIfObjectsIntersect(component: Component, object: object, other: object) {
    for (let descriptorName in object) {
      if (descriptorName in other) {
        throw new TypeError(`Component '${component.constructor.name}' has a conflicting field name`);
      }
    }
  }

  private static extendPrototypeFromComponent(prototype: object, componentPrototype: object) {
    let extendedPrototype = Object.assign(prototype, componentPrototype);

    (extendedPrototype as any).constructor = null;

    return extendedPrototype;
  }

  mix<V extends Partial<T>>(component: V) {
    this.mixAndCheckPrototypeOf(component);
    this.mixAndCheckPropertiesOf(component);

    return this as any as EntityBuilder<T, U & V>;
  }

  build(): U {
    return Object.create(this.entityPrototype, this.entityProperties);
  }

  private mixAndCheckPropertiesOf(component: Component) {
    let componentProperties = Object.getOwnPropertyDescriptors(component);

    EntityBuilder.checkIfObjectsIntersect(component, componentProperties, this.entityProperties);

    Object.assign(this.entityProperties, componentProperties);
  }

  private mixAndCheckPrototypeOf(component: Component) {
    let componentPrototype = Object.getPrototypeOf(component);

    EntityBuilder.checkIfObjectsIntersect(component, componentPrototype, this.entityPrototype);

    this.entityPrototype =
        EntityBuilder.extendPrototypeFromComponent(this.entityPrototype, componentPrototype);
  }
}
