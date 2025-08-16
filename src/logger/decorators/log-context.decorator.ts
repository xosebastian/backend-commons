import { als } from '../logger.service';

export function LogContext(data: Record<string, any>): MethodDecorator {
  return (_target, _propertyKey, descriptor: PropertyDescriptor) => {
    const original = descriptor.value as (...args: any[]) => any;
    descriptor.value = function (...args: any[]) {
      const store = als.getStore();
      if (store) Object.assign(store, data);
      return original.apply(this, args);
    };
    return descriptor;
  };
}
