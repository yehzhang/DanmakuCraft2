import Distance from '../../../src/util/math/Distance';
import Point from '../../../src/util/syntax/Point';
import {expect} from 'chai';
import PhysicalConstants from '../../../src/PhysicalConstants';

describe('Distance', () => {
  let distance: Distance;

  beforeEach(() => {
    distance = new Distance(5);
  });

  it('should work correctly', () => {
    expect(distance.isClose(Point.of(0, 0), Point.of(0, 5))).to.be.true;
    expect(distance.isClose(Point.of(0, 0), Point.of(0, 5 + 1e-6))).to.be.false;

    expect(distance.isClose(Point.of(0, 0), Point.of(3, 4))).to.be.true;
    expect(distance.isClose(Point.of(0, 0), Point.of(3 + 1e-6, 4))).to.be.false;

    expect(distance.isClose(
        Point.of(0, 0), Point.of(0, PhysicalConstants.WORLD_SIZE - 5))).to.be.true;
    expect(distance.isClose(
        Point.of(0, 0),
        Point.of(0, PhysicalConstants.WORLD_SIZE - 5 - 1e-6))).to.be.false;
  });

  it('should throw when radius is invalid', () => {
    let ignored = new Distance(0);
    expect(() => new Distance(-1)).to.throw;

    ignored = new Distance(PhysicalConstants.WORLD_SIZE / 2);
    expect(() => new Distance(PhysicalConstants.WORLD_SIZE / 2 + 1e-6)).to.throw;
  });
});
