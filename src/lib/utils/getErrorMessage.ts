export const getErrorMessage = (error: unknown): any => {
  let message: string;
  if (error instanceof Error) {
    message = error.message;
  } else if (error && typeof error === 'object' && 'msg' in error) {
    message = String(error.msg);
  } else if (error && typeof error === 'string') {
    message = error;
  } else {
    message = 'Une erreur est Survenue ! Reéssayer svp.';
  }
  return message;
};
