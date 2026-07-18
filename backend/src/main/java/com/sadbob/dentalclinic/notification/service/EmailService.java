package com.sadbob.dentalclinic.notification.service;

import com.sadbob.dentalclinic.appointment.entity.Appointment;
import com.sadbob.dentalclinic.auth.entity.User;
import com.sadbob.dentalclinic.billing.entity.Invoice;

public interface EmailService {

    void sendAppointmentConfirmation(Appointment appointment);

    void sendAppointmentStatusUpdate(Appointment appointment);

    void sendInvoiceIssued(Invoice invoice);

    void sendPaymentReceived(Invoice invoice);

    void sendWelcomeEmail(User user, String plainPassword);
}