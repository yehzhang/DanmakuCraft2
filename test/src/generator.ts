import {Superposed} from '../../src/law';
import {Point} from './util';
import {SuperposedEntity} from '../../src/entity/entity';
import PhysicalConstants from '../../src/PhysicalConstants';
import {expect} from 'chai';

export function generateSuperposedTests(superposedFactory: () => Superposed) {
  let superposed: Superposed;

  beforeEach(() => {
    superposed = superposedFactory();
  });

  it('measure() returns a display when decoherent', () => {
    superposed.decohere(Point.origin());

    expect(superposed.measure()).to.be.an.instanceOf(PIXI.DisplayObject);

    superposed.cohere();
    superposed.decohere(Point.origin());

    expect(superposed.measure()).to.be.an.instanceOf(PIXI.DisplayObject);
  });

  it('measure() throws when coherent', () => {
    superposed.decohere(Point.origin());
    superposed.cohere();

    expect(() => superposed.measure()).to.throw();

    superposed.decohere(Point.origin());
    superposed.cohere();

    expect(() => superposed.measure()).to.throw();
  });

  it('is coherent by default', () => {
    expect(() => superposed.measure()).to.throw();
  });

  it('decohere() throws when region is decoherent', () => {
    superposed.decohere(Point.origin());
    expect(() => superposed.decohere(Point.origin())).to.throw();
    expect(() => superposed.decohere(Point.origin())).to.throw();
  });

  it('cohere() throws when region is coherent', () => {
    expect(() => superposed.cohere()).to.throw();
    expect(() => superposed.cohere()).to.throw();
  });
}

export function generateSuperposedEntityTests(
    superposedEntityFactory: (coordinate: Phaser.Point) => SuperposedEntity) {
  generateSuperposedTests(() => superposedEntityFactory(Point.origin()));

  it(`decohere() sets display's position`, () => {
    let entity = superposedEntityFactory(Point.origin());
    entity.decohere(Point.origin());

    expect(Point.from(entity.measure().position)).to.deep.equal(Point.origin());

    entity.cohere();
    entity.decohere(Point.of(-1, -1));

    expect(Point.from(entity.measure().position)).to.deep.equal(Point.of(1, 1));

    entity.cohere();
    entity.decohere(Point.of(PhysicalConstants.WORLD_SIZE - 1, PhysicalConstants.WORLD_SIZE - 1));

    expect(Point.from(entity.measure().position)).to.deep.equal(Point.of(1, 1));

    entity.cohere();
    entity.decohere(Point.of(PhysicalConstants.WORLD_SIZE, PhysicalConstants.WORLD_SIZE));

    expect(Point.from(entity.measure().position)).to.deep.equal(Point.origin());

    entity.cohere();
    entity.decohere(Point.of(PhysicalConstants.WORLD_SIZE / 2, PhysicalConstants.WORLD_SIZE / 2));

    expect(Point.from(entity.measure().position)).to.deep.equal(
        Point.of(-PhysicalConstants.WORLD_SIZE / 2, -PhysicalConstants.WORLD_SIZE / 2));

    entity.cohere();
    entity.decohere(Point.of(PhysicalConstants.WORLD_SIZE / 2 + 1, PhysicalConstants.WORLD_SIZE / 2 + 1));

    expect(Point.from(entity.measure().position)).to.deep.equal(
        Point.of(PhysicalConstants.WORLD_SIZE / 2 - 1, PhysicalConstants.WORLD_SIZE / 2 - 1));

    let entity2 = superposedEntityFactory(Point.of(-1, -1));
    entity2.decohere(Point.of(PhysicalConstants.WORLD_SIZE, PhysicalConstants.WORLD_SIZE));

    expect(Point.from(entity2.measure().position)).to.deep.equal(Point.of(-1, -1));

    entity2.cohere();
    entity2.decohere(Point.of(PhysicalConstants.WORLD_SIZE - 1, PhysicalConstants.WORLD_SIZE - 1));

    expect(Point.from(entity2.measure().position)).to.deep.equal(Point.of(0, 0));

    entity2.cohere();
    entity2.decohere(Point.of(PhysicalConstants.WORLD_SIZE - 2, PhysicalConstants.WORLD_SIZE - 2));

    expect(Point.from(entity2.measure().position)).to.deep.equal(Point.of(1, 1));

    entity2.cohere();
    entity2.decohere(Point.origin());

    expect(Point.from(entity2.measure().position)).to.deep.equal(Point.of(-1, -1));

    entity2.cohere();
    entity2.decohere(Point.of(1, 1));

    expect(Point.from(entity2.measure().position)).to.deep.equal(Point.of(-2, -2));
  });
}
