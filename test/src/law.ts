import {toWorldCoordinate, toWorldCoordinateOffset} from '../../src/law/space';
import {expect} from 'chai';

describe('toWorldCoordinate', () => {
  it('works', () => {
    expect(toWorldCoordinate(0, 10)).to.equal(0);
    expect(toWorldCoordinate(1, 10)).to.equal(1);
    expect(toWorldCoordinate(9, 10)).to.equal(9);

    expect(toWorldCoordinate(10, 10)).to.equal(0);
    expect(toWorldCoordinate(11, 10)).to.equal(1);
    expect(toWorldCoordinate(20, 10)).to.equal(0);

    expect(toWorldCoordinate(-1, 10)).to.equal(9);
    expect(toWorldCoordinate(-9, 10)).to.equal(1);

    expect(toWorldCoordinate(-10, 10)).to.equal(0);
    expect(toWorldCoordinate(-11, 10)).to.equal(9);
    expect(toWorldCoordinate(-20, 10)).to.equal(0);
  });

  it('validates arguments', () => {
    expect(() => toWorldCoordinate(1, -1)).to.throw();
    expect(() => toWorldCoordinate(1, 0)).to.throw();
    expect(() => toWorldCoordinate(NaN, 0)).to.throw();
    expect(() => toWorldCoordinate(Infinity, 0)).to.throw();
    expect(() => toWorldCoordinate(-Infinity, 0)).to.throw();

    expect(() => toWorldCoordinate(NaN, 1)).to.throw();
    expect(() => toWorldCoordinate(Infinity, 1)).to.throw();
    expect(() => toWorldCoordinate(-Infinity, 1)).to.throw();
    expect(() => toWorldCoordinate(1, NaN)).to.throw();
    expect(() => toWorldCoordinate(1, Infinity)).to.throw();
    expect(() => toWorldCoordinate(1, -Infinity)).to.throw();

    expect(() => toWorldCoordinate(NaN, NaN)).to.throw();
    expect(() => toWorldCoordinate(Infinity, -Infinity)).to.throw();
    expect(() => toWorldCoordinate(-Infinity, Infinity)).to.throw();
    expect(() => toWorldCoordinate(Infinity, Infinity)).to.throw();
    expect(() => toWorldCoordinate(-Infinity, -Infinity)).to.throw();
    expect(() => toWorldCoordinate(-Infinity, NaN)).to.throw();
    expect(() => toWorldCoordinate(Infinity, NaN)).to.throw();
    expect(() => toWorldCoordinate(NaN, -Infinity)).to.throw();
    expect(() => toWorldCoordinate(NaN, Infinity)).to.throw();
  });
});

describe('toWorldCoordinateOffset', () => {
  it('works', () => {
    expect(toWorldCoordinateOffset(0, 0, 10)).to.equal(0);
    expect(toWorldCoordinateOffset(0, 1, 10)).to.equal(-1);
    expect(toWorldCoordinateOffset(0, 4, 10)).to.equal(-4);
    expect(toWorldCoordinateOffset(0, 5, 10)).to.equal(-5);
    expect(toWorldCoordinateOffset(0, 6, 10)).to.equal(4);
    expect(toWorldCoordinateOffset(0, 9, 10)).to.equal(1);
    expect(toWorldCoordinateOffset(0, 10, 10)).to.equal(0);
    expect(toWorldCoordinateOffset(0, 11, 10)).to.equal(-1);
    expect(toWorldCoordinateOffset(0, 21, 10)).to.equal(-1);

    expect(toWorldCoordinateOffset(0, 0, 10)).to.equal(0);
    expect(toWorldCoordinateOffset(1, 0, 10)).to.equal(1);
    expect(toWorldCoordinateOffset(4, 0, 10)).to.equal(4);
    expect(toWorldCoordinateOffset(5, 0, 10)).to.equal(5);
    expect(toWorldCoordinateOffset(6, 0, 10)).to.equal(-4);
    expect(toWorldCoordinateOffset(9, 0, 10)).to.equal(-1);
    expect(toWorldCoordinateOffset(10, 0, 10)).to.equal(0);
    expect(toWorldCoordinateOffset(11, 0, 10)).to.equal(1);
    expect(toWorldCoordinateOffset(21, 0, 10)).to.equal(1);

    expect(toWorldCoordinateOffset(-1, 0, 10)).to.equal(-1);
    expect(toWorldCoordinateOffset(-11, 0, 10)).to.equal(-1);
    expect(toWorldCoordinateOffset(-21, 0, 10)).to.equal(-1);
    expect(toWorldCoordinateOffset(-21, 21, 10)).to.equal(-2);
    expect(toWorldCoordinateOffset(21, -21, 10)).to.equal(2);
    expect(toWorldCoordinateOffset(-21, -21, 10)).to.equal(0);
    expect(toWorldCoordinateOffset(-21, -22, 10)).to.equal(1);
    expect(toWorldCoordinateOffset(-21, -42, 10)).to.equal(1);

    expect(toWorldCoordinateOffset(-200, 2001, 10)).to.equal(-1);
  });

  it('validates arguments', () => {
    expect(() => toWorldCoordinateOffset(1, 1, 0)).to.throw();
    expect(() => toWorldCoordinateOffset(1, NaN, 1)).to.throw();
  });
});
