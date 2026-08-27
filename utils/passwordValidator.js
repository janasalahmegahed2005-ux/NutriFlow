const commonPasswords = [
  "password",
  "password123",
  "123456789",
  "1234567890",
  "qwerty",
  "qwerty123",
  "admin",
  "admin123",
  "letmein",
  "welcome",
];

const validatePassword = (password, firstName, lastName, email) => {
  const errors = [];

  if (!password) {
    errors.push("Password is required.");
    return errors;
  }

  // Minimum length
  if (password.length < 12) {
    errors.push("Password must be at least 12 characters long.");
  }

  // Character requirements
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter.");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter.");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number.");
  }

  if (!/[.,'";]/.test(password)) {
    errors.push(
      'Password must contain at least one special character: . , \' ; "'
    );
  }

  // No three identical characters in a row
  if (/(.)\1\1/.test(password)) {
    errors.push(
      "Password cannot contain the same character three times in a row."
    );
  }


  // Reject very common passwords
  const lowerPassword = password.toLowerCase();

  if (commonPasswords.includes(lowerPassword)) {
    errors.push("This password is too common. Please choose a stronger password.");
  }

  // Password should not contain the user's name
  if (
    firstName &&
    firstName.length >= 3 &&
    lowerPassword.includes(firstName.toLowerCase())
  ) {
    errors.push("Password cannot contain your first name.");
  }

  if (
    lastName &&
    lastName.length >= 3 &&
    lowerPassword.includes(lastName.toLowerCase())
  ) {
    errors.push("Password cannot contain your last name.");
  }

  // Password should not contain the email username
  if (email) {
    const emailUsername = email.split("@")[0].toLowerCase();

    if (
      emailUsername.length >= 3 &&
      lowerPassword.includes(emailUsername)
    ) {
      errors.push("Password cannot contain your email username.");
    }
  }

  return errors;
};

module.exports = validatePassword;