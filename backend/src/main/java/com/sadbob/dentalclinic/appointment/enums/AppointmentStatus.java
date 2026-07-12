package com.sadbob.dentalclinic.appointment.enums;

public enum AppointmentStatus {
    SCHEDULED,
    CONFIRMED,
    COMPLETED,
    CANCELLED,
    NO_SHOW;

    public boolean isTerminal() {
        return this == COMPLETED || this == CANCELLED || this == NO_SHOW;
    }

    public boolean canTransitionTo(AppointmentStatus next) {
        return switch (this) {
            case SCHEDULED -> next == CONFIRMED
                    || next == CANCELLED
                    || next == NO_SHOW;
            case CONFIRMED -> next == COMPLETED
                    || next == CANCELLED;
            default -> false; // terminal states
        };
    }
}