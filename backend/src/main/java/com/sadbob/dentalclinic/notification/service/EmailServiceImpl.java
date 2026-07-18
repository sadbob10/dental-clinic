package com.sadbob.dentalclinic.notification.service;

import com.sadbob.dentalclinic.appointment.entity.Appointment;
import com.sadbob.dentalclinic.auth.entity.User;
import com.sadbob.dentalclinic.billing.entity.Invoice;
import com.sadbob.dentalclinic.common.config.ClinicProperties;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender   mailSender;
    private final ClinicProperties clinicProperties;

    @Value("${notification.from-email}")
    private String fromEmail;

    @Value("${notification.from-name}")
    private String fromName;

    @Value("${notification.enabled:true}")
    private boolean enabled;

    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");

    // ── Public methods ────────────────────────────────────────────────────────

    @Async
    @Override
    public void sendAppointmentConfirmation(Appointment appointment) {
        String to = appointment.getPatient().getEmail();
        if (skipEmail(to, "appointment confirmation")) return;

        String subject = "Appointment Confirmation — " + clinicProperties.getName();
        String body = """
                <html><body style="font-family: Arial, sans-serif; color: #333;">
                  <h2 style="color: #2980b9;">Appointment Confirmed ✓</h2>
                  <p>Dear <strong>%s</strong>,</p>
                  <p>Your appointment has been scheduled successfully.</p>
                  <table style="border-collapse: collapse; width: 100%%;">
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date & Time</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">%s</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Dentist</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">%s</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Type</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">%s</td></tr>
                  </table>
                  <p>If you need to reschedule or cancel, please contact us at <strong>%s</strong>.</p>
                  <p>We look forward to seeing you!</p>
                  <p style="color: #888;">— %s</p>
                </body></html>
                """.formatted(
                appointment.getPatient().getFullName(),
                appointment.getScheduledAt().format(FMT),
                appointment.getDentist().getFullName(),
                appointment.getType().name(),
                clinicProperties.getPhone(),
                clinicProperties.getName()
        );

        send(to, subject, body);
    }

    @Async
    @Override
    public void sendAppointmentStatusUpdate(Appointment appointment) {
        String to = appointment.getPatient().getEmail();
        if (skipEmail(to, "appointment status update")) return;

        String status = appointment.getStatus().name();
        String emoji  = switch (appointment.getStatus()) {
            case CONFIRMED  -> "✓";
            case CANCELLED  -> "✗";
            case COMPLETED  -> "★";
            default         -> "•";
        };

        String subject = "Appointment " + status + " " + emoji +
                " — " + clinicProperties.getName();

        String body = """
                <html><body style="font-family: Arial, sans-serif; color: #333;">
                  <h2 style="color: #2980b9;">Appointment Update</h2>
                  <p>Dear <strong>%s</strong>,</p>
                  <p>Your appointment status has been updated to:
                     <strong>%s</strong></p>
                  <table style="border-collapse: collapse; width: 100%%;">
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Date & Time</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">%s</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Dentist</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">%s</td></tr>
                  </table>
                  <p>For any questions, contact us at <strong>%s</strong>.</p>
                  <p style="color: #888;">— %s</p>
                </body></html>
                """.formatted(
                appointment.getPatient().getFullName(),
                status,
                appointment.getScheduledAt().format(FMT),
                appointment.getDentist().getFullName(),
                clinicProperties.getPhone(),
                clinicProperties.getName()
        );

        send(to, subject, body);
    }

    @Async
    @Override
    public void sendInvoiceIssued(Invoice invoice) {
        String to = invoice.getPatient().getEmail();
        if (skipEmail(to, "invoice issued")) return;

        String subject = "Invoice #" + invoice.getId() +
                " Ready — " + clinicProperties.getName();

        String body = """
                <html><body style="font-family: Arial, sans-serif; color: #333;">
                  <h2 style="color: #2980b9;">Invoice Ready</h2>
                  <p>Dear <strong>%s</strong>,</p>
                  <p>Your invoice is ready for payment.</p>
                  <table style="border-collapse: collapse; width: 100%%;">
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Invoice #</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">%d</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount Due</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">%.2f</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Due Date</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">%s</td></tr>
                  </table>
                  <p>Please contact us at <strong>%s</strong> to arrange payment.</p>
                  <p style="color: #888;">— %s</p>
                </body></html>
                """.formatted(
                invoice.getPatient().getFullName(),
                invoice.getId(),
                invoice.getNetAmount(),
                invoice.getDueDate() != null
                        ? invoice.getDueDate().format(FMT) : "N/A",
                clinicProperties.getPhone(),
                clinicProperties.getName()
        );

        send(to, subject, body);
    }

    @Async
    @Override
    public void sendPaymentReceived(Invoice invoice) {
        String to = invoice.getPatient().getEmail();
        if (skipEmail(to, "payment received")) return;

        String subject = "Payment Received ✓ — " + clinicProperties.getName();

        String body = """
                <html><body style="font-family: Arial, sans-serif; color: #333;">
                  <h2 style="color: #27ae60;">Payment Received ✓</h2>
                  <p>Dear <strong>%s</strong>,</p>
                  <p>We have received your payment. Thank you!</p>
                  <table style="border-collapse: collapse; width: 100%%;">
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Invoice #</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">%d</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Status</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">%s</td></tr>
                  </table>
                  <p>Thank you for choosing <strong>%s</strong>.</p>
                  <p style="color: #888;">— %s</p>
                </body></html>
                """.formatted(
                invoice.getPatient().getFullName(),
                invoice.getId(),
                invoice.getStatus().name(),
                clinicProperties.getName(),
                clinicProperties.getName()
        );

        send(to, subject, body);
    }

    @Async
    @Override
    public void sendWelcomeEmail(User user, String plainPassword) {
        String to = user.getEmail();
        if (skipEmail(to, "welcome email")) return;

        String subject = "Welcome to " + clinicProperties.getName();

        String body = """
                <html><body style="font-family: Arial, sans-serif; color: #333;">
                  <h2 style="color: #2980b9;">Welcome to %s!</h2>
                  <p>Dear <strong>%s</strong>,</p>
                  <p>Your staff account has been created. Here are your login credentials:</p>
                  <table style="border-collapse: collapse; width: 100%%;">
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Email</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">%s</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Password</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">%s</td></tr>
                    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Role</strong></td>
                        <td style="padding: 8px; border: 1px solid #ddd;">%s</td></tr>
                  </table>
                  <p style="color: #e74c3c;"><strong>Please change your password after first login.</strong></p>
                  <p style="color: #888;">— %s</p>
                </body></html>
                """.formatted(
                clinicProperties.getName(),
                user.getFullName(),
                user.getEmail(),
                plainPassword,
                user.getRole().name(),
                clinicProperties.getName()
        );

        send(to, subject, body);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private void send(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to: {} | Subject: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to: {} | Error: {}", to, e.getMessage());
        }
    }

    private boolean skipEmail(String email, String type) {
        if (!enabled) {
            log.debug("Notifications disabled — skipping {}", type);
            return true;
        }
        if (email == null || email.isBlank()) {
            log.warn("Skipping {} — patient has no email address", type);
            return true;
        }
        return false;
    }
}