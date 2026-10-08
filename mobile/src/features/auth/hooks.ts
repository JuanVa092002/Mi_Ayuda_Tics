import { useMutation } from '@tanstack/react-query';
import { forgotPasswordRequest, resetPasswordRequest } from './api';
import { mapPasswordRecoveryError } from './password-recovery-errors';

export function useForgotPassword() {
  const mutation = useMutation({
    mutationFn: (correo: string) => forgotPasswordRequest(correo),
  });

  return {
    submit: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    successMessage: mutation.data?.message,
    error: mutation.error ? mapPasswordRecoveryError(mutation.error, 'forgot') : null,
    reset: mutation.reset,
  };
}

export function useResetPassword() {
  const mutation = useMutation({
    mutationFn: (input: { token: string; password: string; confirmPassword: string }) =>
      resetPasswordRequest(input.token, input.password, input.confirmPassword),
  });

  return {
    submit: mutation.mutateAsync,
    isSubmitting: mutation.isPending,
    isSuccess: mutation.isSuccess,
    successMessage: mutation.data?.message,
    error: mutation.error ? mapPasswordRecoveryError(mutation.error, 'reset') : null,
    reset: mutation.reset,
  };
}
