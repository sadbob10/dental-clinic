package com.sadbob.dentalclinic.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordConstraintValidator
        implements ConstraintValidator<ValidPassword, String> {

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null) return false;

        boolean hasUpper   = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLower   = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit   = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecial = password.chars()
                .anyMatch(c -> "!@#$%^&*()_+-=[]{}|;':\",./<>?".indexOf(c) >= 0);
        boolean hasLength  = password.length() >= 8;

        if (!hasLength || !hasUpper || !hasLower || !hasDigit || !hasSpecial) {
            context.disableDefaultConstraintViolation();
            context.buildConstraintViolationWithTemplate(buildMessage(
                            hasLength, hasUpper, hasLower, hasDigit, hasSpecial))
                    .addConstraintViolation();
            return false;
        }

        return true;
    }

    private String buildMessage(boolean hasLength, boolean hasUpper,
                                boolean hasLower, boolean hasDigit,
                                boolean hasSpecial) {
        StringBuilder msg = new StringBuilder("Password must have: ");
        if (!hasLength)  msg.append("at least 8 characters; ");
        if (!hasUpper)   msg.append("one uppercase letter; ");
        if (!hasLower)   msg.append("one lowercase letter; ");
        if (!hasDigit)   msg.append("one digit; ");
        if (!hasSpecial) msg.append("one special character (!@#$%^&* etc); ");
        return msg.toString().trim();
    }
}