// function to resolve zod schema we provide
import { zodResolver } from '@hookform/resolvers/zod';

import {
  useForm as useHookForm,
  UseFormProps as UseHookFormProps,
} from 'react-hook-form';

// Type of zod schema
import { ZodSchema, TypeOf } from 'zod';

// We provide additional option that would be our zod schema.
interface UseFormProps<T extends ZodSchema<any>>
  extends UseHookFormProps<TypeOf<T>> {
  schema: T;
}

export const useForm = <T extends ZodSchema<any>>({
  schema,
  ...formConfig
}: UseFormProps<T>) => {
  return useHookForm({
    ...formConfig,
    resolver: zodResolver(schema),
  });
};
