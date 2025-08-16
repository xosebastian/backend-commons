import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

/**
 * Lightweight validation pipe for library consumers that are not using Nest's built-in ValidationPipe.
 */
@Injectable()
export class ValidationPipe implements PipeTransform<unknown, Promise<unknown>> {
  public async transform(value: unknown, { metatype }: ArgumentMetadata): Promise<unknown> {
    if (!metatype || !this.isClass(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype as new (...args: unknown[]) => unknown, value);
    const errors = await validate(object as object, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length > 0) {
      throw new BadRequestException({ message: 'Validation failed', errors });
    }
    return object;
  }

  private isClass(metatype: unknown): boolean {
    const types: unknown[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}

