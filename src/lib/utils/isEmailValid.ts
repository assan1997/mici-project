export function isEmailValid(email: string): boolean {
    // Expression régulière pour valider une adresse e-mail
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
  
    // Vérifier si l'adresse e-mail correspond à l'expression régulière
    return emailRegex.test(email);
  }
  