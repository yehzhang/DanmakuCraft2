import { Persistor } from 'redux-persist';
import ConsoleInput from './ConsoleInput';
import { Store } from './redux';

// Indicates this is a module.
export {};

declare global {
  interface Window {
    store?: Store;
    d?: ConsoleInput;
    persistor?: Persistor;
  }
}
