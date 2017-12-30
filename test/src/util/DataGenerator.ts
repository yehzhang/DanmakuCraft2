import DataScaler from '../../../src/util/dataGenerator/DataScaler';
import {expect} from 'chai';

const epsilon = 0.000001;

describe('DataScaler', () => {
  describe('should work correctly when between is called', () => {
    it('on the range [0, 1]', () => {
      let scaler = DataScaler.between(0, 1);

      expect(scaler.transform(0)).to.equal(0);
      expect(scaler.transform(0.1)).to.equal(0.1);
      expect(scaler.transform(0.5)).to.equal(0.5);
      expect(scaler.transform(1)).to.equal(1);
    });

    it('on the range [-1, 1]', () => {
      let scaler = DataScaler.between(-1, 1);

      expect(scaler.transform(0)).to.equal(-1);
      expect(scaler.transform(0.1)).to.equal(-0.8);
      expect(scaler.transform(0.5)).to.equal(0);
      expect(scaler.transform(1)).to.equal(1);
    });

    it('on the range [-10.5, 20.1]', () => {
      let scaler = DataScaler.between(-10.5, 20.1);

      expect(scaler.transform(0)).to.equal(-10.5);
      expect(scaler.transform(0.1)).to.be.closeTo(-7.44, epsilon);
      expect(scaler.transform(0.5)).to.be.closeTo(4.8, epsilon);
      expect(scaler.transform(1)).to.equal(20.1);
    });
  });

  describe('should work correctly when map is called', () => {
    it('from [0, 1] to [-2, 2]', () => {
      let scaler = DataScaler.map(0, 1, -2, 2);

      expect(scaler.transform(0)).to.equal(-2);
      expect(scaler.transform(0.1)).to.equal(-1.6);
      expect(scaler.transform(0.5)).to.equal(0);
      expect(scaler.transform(1)).to.equal(2);
    });

    it('from [-2, 2] to [0, 1]', () => {
      let scaler = DataScaler.map(-2, 2, 0, 1);

      expect(scaler.transform(-2)).to.equal(0);
      expect(scaler.transform(-1.5)).to.equal(0.125);
      expect(scaler.transform(0)).to.equal(0.5);
      expect(scaler.transform(0.3)).to.equal(0.575);
      expect(scaler.transform(2)).to.equal(1);
    });
  });
});
