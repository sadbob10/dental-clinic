package com.sadbob.dentalclinic.billing.enums;

public enum InvoiceStatus {
    DRAFT,
    ISSUED,
    PARTIALLY_PAID,
    PAID,
    CANCELLED;

    public boolean isTerminal() {
        return this == PAID || this == CANCELLED;
    }

    public boolean isEditable() {
        return this == DRAFT;
    }

    public boolean canAcceptPayment() {
        return this == ISSUED || this == PARTIALLY_PAID;
    }

    public boolean canTransitionTo(InvoiceStatus next) {
        return switch (this) {
            case DRAFT   -> next == ISSUED || next == CANCELLED;
            case ISSUED  -> next == CANCELLED;
            default      -> false; // terminal or auto-updated by payment
        };
    }
}