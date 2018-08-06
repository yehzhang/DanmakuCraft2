import {expect} from 'chai';
import SetStreamJoiner from '../../../client/src/util/dataStructures/SetStreamJoiner';

describe('SetStreamJoiner', () => {
  let joiner: SetStreamJoiner<number>;

  function instantiate<T>(leftValues: T[], innerValues: T[], rightValues: T[]) {
    return new SetStreamJoiner(new Set(leftValues), new Set(innerValues), new Set(rightValues));
  }

  function expectJoinerToEqual<T>(leftValues: T[], innerValues: T[], rightValues: T[]) {
    expect({
      leftValues: Array.from(joiner.leftValues).sort(),
      innerValues: Array.from(joiner.innerValues).sort(),
      rightValues: Array.from(joiner.rightValues).sort(),
    }).to.deep.equal({
      leftValues: leftValues.sort(),
      innerValues: innerValues.sort(),
      rightValues: rightValues.sort(),
    });
  }

  it('should keep left, inner, right, and the last stream set', () => {
    joiner = instantiate([1], [2], [3]);
    expectJoinerToEqual([1], [2], [3]);
  });

  describe('on add() called', () => {
    it('should left a new value', () => {
      joiner = instantiate([], [], []);
      joiner.add(1);

      expectJoinerToEqual([1], [], []);
    });

    it('should not add a left value', () => {
      joiner = instantiate([1], [], []);
      joiner.add(1);

      expectJoinerToEqual([1], [], []);
    });

    it('should not change an inner value', () => {
      joiner = instantiate([], [1], []);
      joiner.add(1);

      expectJoinerToEqual([], [1], []);
    });

    it('should inner a right value', () => {
      joiner = instantiate([], [], [1]);
      joiner.add(1);

      expectJoinerToEqual([], [1], []);
    });
  });

  describe('on flush() called', () => {
    it('should right left values', () => {
      joiner = instantiate([1], [], []);
      joiner.flush();

      expectJoinerToEqual([], [], [1]);
    });

    it('should right inner values', () => {
      joiner = instantiate([], [1], []);
      joiner.flush();

      expectJoinerToEqual([], [], [1]);
    });

    it('should empty right values', () => {
      joiner = instantiate([], [], [1]);
      joiner.flush();

      expectJoinerToEqual([], [], []);
    });
  });

  it('should produce expected result', () => {
    joiner = new SetStreamJoiner();
    joiner.add(1);
    joiner.add(2);
    joiner.add(1);

    expectJoinerToEqual([1, 2], [], []);

    joiner.flush();

    expectJoinerToEqual([], [], [1, 2]);

    joiner.add(1);

    expectJoinerToEqual([], [1], [2]);

    joiner.add(1);

    expectJoinerToEqual([], [1], [2]);

    joiner.add(2);

    expectJoinerToEqual([], [1, 2], []);

    joiner.add(3);

    expectJoinerToEqual([3], [1, 2], []);

    joiner.add(3);

    expectJoinerToEqual([3], [1, 2], []);

    joiner.flush();

    expectJoinerToEqual([], [], [1, 2, 3]);

    joiner.add(4);

    expectJoinerToEqual([4], [], [1, 2, 3]);

    joiner.add(3);

    expectJoinerToEqual([4], [3], [1, 2]);

    joiner.flush();

    expectJoinerToEqual([], [], [3, 4]);

    joiner.flush();

    expectJoinerToEqual([], [], []);

    joiner.add(4);
    joiner.add(5);
    joiner.flush();
    joiner.add(4);

    expectJoinerToEqual([], [4], [5]);

    joiner.add(6);

    expectJoinerToEqual([6], [4], [5]);
  });
});
