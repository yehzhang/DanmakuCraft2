import {expect} from 'chai';
import {EntityBuilder} from '../../../client/src/entitySystem/Entity';

describe('EntityBuilder', () => {
  let entityBuilder: EntityBuilder<any>;

  beforeEach(() => {
    entityBuilder = new EntityBuilder();
  });

  it('mixes an empty object with anything', () => {
    const result = entityBuilder.mix({}).mix({}).build();
    expect(result).to.deep.equal({});
  });

  it('mixes plain objects', () => {
    const fn = () => {
    };
    const actual = entityBuilder
        .mix({
          b: false,
          a: 1,
        })
        .mix({
          d: [],
        })
        .mix({
          c: '',
          f: fn,
        })
        .build();

    class Mixed {
      a = 1;
      b = false;
      c = '';
      d = [];
      f = fn;
    }

    const expected = new Mixed();

    expect(actual).to.deep.equal(expected);
  });

  it('mixes class instances', () => {
    class A {
      b = false;
      a = 1;

      c() {
      }
    }

    class B {
      e = [];

      d() {
      }
    }

    class C extends B {
      f() {
      }
    }

    const actual: any = entityBuilder.mix(new A()).mix(new C()).build();
    const actualObject = {
      b: actual.b,
      a: actual.a,
      e: actual.e,
      __proto__: {
        constructor: actual.__proto__.constructor,
        c: actual.__proto__.c,
        f: actual.__proto__.f,
        __proto__: {
          constructor: actual.__proto__.__proto__.constructor,
          d: actual.__proto__.__proto__.d,
          __proto__: actual.__proto__.__proto__.__proto__,
        }
      }
    };

    expect(actualObject).to.deep.equal({
      b: false,
      a: 1,
      e: [],
      __proto__: {
        constructor: C.prototype.constructor,
        c: A.prototype.c,
        f: C.prototype.f,
        __proto__: {
          constructor: B.prototype.constructor,
          d: B.prototype.d,
          __proto__: Object.getPrototypeOf({}),
        }
      }
    });
  });

  it('mixes getters and setters', () => {
    class A {
      a = 1;

      get c() {
        return '';
      }
    }

    class B {
      b = [];

      get d() {
        return {};
      }

      set d(value: any) {
      }
    }

    class C {
      set e(value: any) {
      }
    }

    const actual = entityBuilder.mix(new A()).mix(new B()).mix(new C()).build();

    class Expected {
      a = 1;
      b = [];
    }

    const basePrototype = Object.assign({
      constructor: A.prototype.constructor,
    }, Expected.prototype);
    const expectedPrototype = Object.create(basePrototype, {
      c: Object.getOwnPropertyDescriptor(A.prototype, 'c'),
      d: Object.getOwnPropertyDescriptor(B.prototype, 'd'),
      e: Object.getOwnPropertyDescriptor(C.prototype, 'e'),
    } as any);
    Object.assign(Expected.prototype, expectedPrototype);

    const expected = new Expected();

    expect(actual).to.deep.equal(expected);
  });

  it('throws when mixing getter and setter of the same name', () => {
    class A {
      get a() {
        return '';
      }
    }

    class B {
      set a(value: any) {
      }
    }

    expect(() => entityBuilder.mix(new A()).mix(new B())).to.throw();
  });

  it('mixes symbols', () => {
    class A {
      [Symbol.iterator] = 1;
    }

    class B {
    }

    const b: any = new B();
    const symbolB = Symbol('B');
    b[symbolB] = 2;

    const actual = entityBuilder.mix(new A()).mix(b).build();

    class Mixed {
      [Symbol.iterator] = 1;
    }

    const expected: any = new Mixed();

    expected[symbolB] = 2;

    expect(actual).to.deep.equal(expected);
  });

  it('throws when properties conflict', () => {
    expect(() => entityBuilder.mix({a: 1}).mix({a: 2})).to.throw();
  });

  it('throws when prototypes conflict', () => {
    class A {
      a() {
      }
    }

    class B {
      a() {
      }
    }

    expect(() => entityBuilder.mix(new A()).mix(new A())).to.throw();
    expect(() => entityBuilder.mix(new A()).mix(new B())).to.throw();
  });

  it('throws when no entity was mixed', () => {
    expect(() => entityBuilder.build()).to.throw();
  });
});
