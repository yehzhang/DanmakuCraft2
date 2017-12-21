import {EntityBuilder} from '../../../src/entitySystem/Entity';
import {expect} from 'chai';

describe('EntityBuilder', () => {
  let entityBuilder: EntityBuilder<any>;

  beforeEach(() => {
    entityBuilder = new EntityBuilder();
  });

  it('mixes an empty object with anything', () => {
    let result = entityBuilder.mix({}).mix({}).build();
    expect(result).to.deep.equal({});
  });

  it('mixes plain objects', () => {
    let fn = () => {
    };
    let actual = entityBuilder
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

    let expected = new Mixed();

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

    let actual = entityBuilder.mix(new A()).mix(new C()).build();

    class Mixed {
      b = false;
      a = 1;
      e = [];
    }

    Object.assign(Mixed.prototype, {
      constructor: C,
      c: A.prototype.c,
      f: C.prototype.f,
    });
    Object.setPrototypeOf(Mixed.prototype, {
      constructor: B,
      d: B.prototype.d,
    });

    let expected = new Mixed();

    expect(actual).to.deep.equal(expected);
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

    let actual = entityBuilder.mix(new A()).mix(new B()).mix(new C()).build();

    class Mixed {
      a = 1;
      b = [];
    }

    Mixed.prototype.constructor = C;
    Mixed.prototype = Object.create(Mixed.prototype, {
      c: Object.getOwnPropertyDescriptor(A.prototype, 'c'),
      d: Object.getOwnPropertyDescriptor(B.prototype, 'd'),
      e: Object.getOwnPropertyDescriptor(C.prototype, 'e'),
    } as any);

    let expected = new Mixed();

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

    let b: any = new B();
    let symbolB = Symbol('B');
    b[symbolB] = 2;

    let actual = entityBuilder.mix(new A()).mix(b).build();

    class Mixed {
      [Symbol.iterator] = 1;
    }

    let expected: any = new Mixed();

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
