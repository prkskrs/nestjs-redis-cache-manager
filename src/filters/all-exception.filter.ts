import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { NormalException } from '../exception/normal.exception';
import { Response } from 'express';
import {
  CheckViolationError,
  ConstraintViolationError,
  DataError,
  DBError,
  ForeignKeyViolationError,
  NotFoundError,
  NotNullViolationError,
  UniqueViolationError,
  ValidationError,
} from 'objection';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    this.logger.error(exception.stack);

    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const isProduction = process.env.NODE_ENV === 'production';

    if (exception instanceof ValidationError) {
      switch (exception.type) {
        case 'ModelValidation': {
          const errorMsg = isProduction
            ? 'Model validation error'
            : exception.message;
          return response
            .status(HttpStatus.BAD_REQUEST)
            .send(NormalException.VALIDATION_ERROR(errorMsg).toJSON());
        }
        case 'RelationExpression': {
          const errorMsg = isProduction
            ? 'Relation expression error'
            : exception.message;
          return response
            .status(HttpStatus.BAD_REQUEST)
            .send(NormalException.VALIDATION_ERROR(errorMsg).toJSON());
        }
        case 'UnallowedRelation': {
          const errorMsg = isProduction
            ? 'Unallowed relation error'
            : exception.message;
          return response
            .status(HttpStatus.BAD_REQUEST)
            .send(NormalException.VALIDATION_ERROR(errorMsg).toJSON());
        }
        case 'InvalidGraph': {
          const errorMsg = isProduction
            ? 'Invalid graph error'
            : exception.message;
          return response
            .status(HttpStatus.BAD_REQUEST)
            .send(NormalException.VALIDATION_ERROR(errorMsg).toJSON());
        }
        default: {
          const errorMsg = isProduction
            ? 'Unknown validation error'
            : exception.message;
          return response
            .status(HttpStatus.BAD_REQUEST)
            .send(NormalException.VALIDATION_ERROR(errorMsg).toJSON());
        }
      }
    } else if (exception instanceof NotNullViolationError) {
      const errorMsg = isProduction
        ? 'Not null violation error'
        : exception.message;
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send(NormalException.UNEXPECTED(errorMsg).toJSON());
    } else if (exception instanceof UniqueViolationError) {
      const errorMsg = isProduction
        ? 'Unique violation error'
        : exception.message;
      return response
        .status(HttpStatus.CONFLICT)
        .send(NormalException.UNEXPECTED(errorMsg).toJSON());
    } else if (exception instanceof ConstraintViolationError) {
      const errorMsg = isProduction
        ? 'Constraint violation error'
        : exception.message;
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send(NormalException.VALIDATION_ERROR(errorMsg).toJSON());
    } else if (exception instanceof DBError) {
      const errorMsg = isProduction
        ? 'Some errors occurred with database'
        : exception.message;
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .send(NormalException.UNEXPECTED(errorMsg).toJSON());
    } else if (exception instanceof DataError) {
      const errorMsg = isProduction ? 'Bad data provided' : exception.message;
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send(NormalException.UNEXPECTED(errorMsg).toJSON());
    } else if (exception instanceof CheckViolationError) {
      const errorMsg = isProduction
        ? 'Check violation error'
        : exception.message;
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send(NormalException.UNEXPECTED(errorMsg).toJSON());
    } else if (exception instanceof ForeignKeyViolationError) {
      const errorMsg = isProduction
        ? 'Foreign key violation error'
        : exception.message;
      return response
        .status(HttpStatus.BAD_REQUEST)
        .send(NormalException.UNEXPECTED(errorMsg).toJSON());
    } else if (exception instanceof NotFoundError) {
      const errorMsg = isProduction ? 'Not found error' : exception.message;
      return response
        .status(HttpStatus.NOT_FOUND)
        .send(NormalException.UNEXPECTED(errorMsg).toJSON());
    }
    // else if (exception instanceof HttpException) {
    //   return response
    //     .status(HttpStatus.INTERNAL_SERVER_ERROR)
    //     .send(NormalException.UNEXPECTED(exception.message).toJSON());
    // }

    if (Array.isArray(exception)) {
      // format exception according to google json style
      const errors = exception.map((e) => {
        const childErrors = e.children?.map((child) => {
          if (child.children?.length) {
            return child.children.map((child2) => {
              return {
                message: child2.constraints[Object.keys(child2.constraints)[0]],
                domain: child2.property,
              };
            });
          }

          return {
            message: child.constraints[Object.keys(child.constraints)[0]],
            domain: child.property,
          };
        });

        return {
          message: childErrors?.length
            ? 'Validation errors'
            : e.constraints[Object.keys(e.constraints)[0]],
          domain: e.property,
          ...(childErrors?.length
            ? {
                children: childErrors,
              }
            : {}),
        };
      });

      return response.status(HttpStatus.BAD_REQUEST).send({
        error: {
          code: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          errors,
        },
      });
    }

    return response
      .status((exception as any)?.getStatus?.() || HttpStatus.BAD_REQUEST)
      .send(NormalException.UNEXPECTED((exception as any)?.message).toJSON());
  }
}
