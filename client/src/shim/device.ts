import * as PIXI from 'pixi.js';

export function selectDevice<T>(devices: DeviceData<T>): T;
export function selectDevice<T>(devices: Partial<DeviceData<T>>): T | undefined;
export function selectDevice<T>(devices: Partial<DeviceData<T>>) {
  return devices[device];
}

type DeviceData<T> = {
  readonly [key in Device]: T;
};

const device: Device = PIXI.utils.isMobile.any ? 'mobile' : 'desktop';

type Device = 'mobile' | 'desktop';
