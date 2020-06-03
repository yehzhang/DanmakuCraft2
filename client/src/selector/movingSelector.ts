import { Selector } from '../shim/redux';

const movingSelector: Selector<boolean> = ({ movement: { up, down, left, right } }) =>
  up !== down || left !== right;

export default movingSelector;
