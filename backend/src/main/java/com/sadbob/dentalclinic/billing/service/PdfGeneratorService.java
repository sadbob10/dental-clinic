package com.sadbob.dentalclinic.billing.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.sadbob.dentalclinic.billing.entity.Invoice;
import com.sadbob.dentalclinic.billing.entity.InvoiceItem;
import com.sadbob.dentalclinic.billing.entity.Payment;
import com.sadbob.dentalclinic.billing.repository.PaymentRepository;
import com.sadbob.dentalclinic.common.config.ClinicProperties;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PdfGeneratorService {

    private final ClinicProperties  clinicProperties;
    private final PaymentRepository paymentRepository;

    private static final DateTimeFormatter DATE_FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATETIME_FMT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    // Colors
    private static final Color HEADER_COLOR  = new Color(41, 128, 185);
    private static final Color LIGHT_GRAY    = new Color(245, 245, 245);
    private static final Color DARK_GRAY     = new Color(80, 80, 80);
    private static final Color WHITE         = Color.WHITE;

    // Fonts
    private Font boldWhite()  { return FontFactory.getFont(FontFactory.HELVETICA_BOLD,  12, WHITE); }
    private Font bold()       { return FontFactory.getFont(FontFactory.HELVETICA_BOLD,  10, DARK_GRAY); }
    private Font normal()     { return FontFactory.getFont(FontFactory.HELVETICA,        9, DARK_GRAY); }
    private Font small()      { return FontFactory.getFont(FontFactory.HELVETICA,        8, DARK_GRAY); }
    private Font titleFont()  { return FontFactory.getFont(FontFactory.HELVETICA_BOLD,  18, WHITE); }
    private Font subTitle()   { return FontFactory.getFont(FontFactory.HELVETICA,        9, WHITE); }

    public byte[] generateInvoicePdf(Invoice invoice) {
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(doc, out);
            doc.open();

            // Header
            addHeader(doc, invoice);

            // Spacing
            doc.add(new Paragraph(" "));

            // Patient + Invoice Info
            addInfoSection(doc, invoice);

            doc.add(new Paragraph(" "));

            // Items Table
            addItemsTable(doc, invoice);

            doc.add(new Paragraph(" "));

            // Totals
            addTotals(doc, invoice);

            doc.add(new Paragraph(" "));

            // Payments
            List<Payment> payments =
                    paymentRepository.findByInvoice_IdOrderByPaidAtDesc(invoice.getId());
            if (!payments.isEmpty()) {
                addPaymentsSection(doc, payments);
            }

            doc.close();
            log.info("PDF generated for invoice: {}", invoice.getId());
            return out.toByteArray();

        } catch (Exception e) {
            log.error("Failed to generate PDF for invoice {}: {}", invoice.getId(), e.getMessage());
            throw new RuntimeException("PDF generation failed", e);
        }
    }

    // ── sections ─────────────────────────────────────────────────────────────

    private void addHeader(Document doc, Invoice invoice) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{1.5f, 1f});

        // Clinic name + address
        PdfPCell clinicCell = new PdfPCell();
        clinicCell.setBackgroundColor(HEADER_COLOR);
        clinicCell.setBorder(Rectangle.NO_BORDER);
        clinicCell.setPadding(12);

        Paragraph clinicName = new Paragraph(clinicProperties.getName(), titleFont());
        Paragraph clinicAddr = new Paragraph(clinicProperties.getAddress(), subTitle());
        Paragraph clinicPhone = new Paragraph(clinicProperties.getPhone(), subTitle());
        Paragraph clinicEmail = new Paragraph(clinicProperties.getEmail(), subTitle());

        clinicCell.addElement(clinicName);
        clinicCell.addElement(clinicAddr);
        clinicCell.addElement(clinicPhone);
        clinicCell.addElement(clinicEmail);
        table.addCell(clinicCell);

        // Invoice label + number
        PdfPCell invoiceCell = new PdfPCell();
        invoiceCell.setBackgroundColor(HEADER_COLOR);
        invoiceCell.setBorder(Rectangle.NO_BORDER);
        invoiceCell.setPadding(12);
        invoiceCell.setHorizontalAlignment(Element.ALIGN_RIGHT);

        Paragraph invoiceLabel = new Paragraph("INVOICE", titleFont());
        Paragraph invoiceNum   = new Paragraph("#" + invoice.getId(), subTitle());
        Paragraph invoiceDate  = new Paragraph(
                "Date: " + invoice.getCreatedAt().format(DATE_FMT), subTitle());
        Paragraph invoiceStatus = new Paragraph(
                "Status: " + invoice.getStatus().name(), subTitle());

        invoiceCell.addElement(invoiceLabel);
        invoiceCell.addElement(invoiceNum);
        invoiceCell.addElement(invoiceDate);
        invoiceCell.addElement(invoiceStatus);
        table.addCell(invoiceCell);

        doc.add(table);
    }

    private void addInfoSection(Document doc, Invoice invoice) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(100);

        // Patient info
        PdfPCell patientCell = new PdfPCell();
        patientCell.setBorder(Rectangle.BOX);
        patientCell.setPadding(8);
        patientCell.setBackgroundColor(LIGHT_GRAY);

        patientCell.addElement(new Paragraph("BILL TO", bold()));
        patientCell.addElement(new Paragraph(
                invoice.getPatient().getFullName(), bold()));
        patientCell.addElement(new Paragraph(
                "Phone: " + invoice.getPatient().getPhone(), normal()));
        if (invoice.getPatient().getEmail() != null) {
            patientCell.addElement(new Paragraph(
                    "Email: " + invoice.getPatient().getEmail(), normal()));
        }
        table.addCell(patientCell);

        // Invoice details
        PdfPCell detailsCell = new PdfPCell();
        detailsCell.setBorder(Rectangle.BOX);
        detailsCell.setPadding(8);
        detailsCell.setBackgroundColor(LIGHT_GRAY);

        detailsCell.addElement(new Paragraph("INVOICE DETAILS", bold()));
        detailsCell.addElement(new Paragraph(
                "Invoice #: " + invoice.getId(), normal()));
        if (invoice.getIssuedAt() != null) {
            detailsCell.addElement(new Paragraph(
                    "Issued: " + invoice.getIssuedAt().format(DATE_FMT), normal()));
        }
        if (invoice.getDueDate() != null) {
            detailsCell.addElement(new Paragraph(
                    "Due: " + invoice.getDueDate().format(DATE_FMT), normal()));
        }
        if (invoice.getAppointment() != null) {
            detailsCell.addElement(new Paragraph(
                    "Appointment: #" + invoice.getAppointment().getId(), normal()));
        }
        table.addCell(detailsCell);

        doc.add(table);
    }

    private void addItemsTable(Document doc, Invoice invoice) throws DocumentException {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{4f, 1f, 1.5f, 1.5f});

        // Header row
        addTableHeader(table, "Description");
        addTableHeader(table, "Qty");
        addTableHeader(table, "Unit Price");
        addTableHeader(table, "Subtotal");

        // Item rows
        boolean alternate = false;
        for (InvoiceItem item : invoice.getItems()) {
            Color rowColor = alternate ? LIGHT_GRAY : WHITE;
            addTableCell(table, item.getDescription(), rowColor, Element.ALIGN_LEFT);
            addTableCell(table, String.valueOf(item.getQuantity()), rowColor, Element.ALIGN_CENTER);
            addTableCell(table, formatAmount(item.getUnitPrice()), rowColor, Element.ALIGN_RIGHT);
            addTableCell(table, formatAmount(item.getSubtotal()), rowColor, Element.ALIGN_RIGHT);
            alternate = !alternate;
        }

        doc.add(table);
    }

    private void addTotals(Document doc, Invoice invoice) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(40);
        table.setHorizontalAlignment(Element.ALIGN_RIGHT);

        BigDecimal paid = paymentRepository.sumPaidByInvoiceId(invoice.getId());
        BigDecimal balance = invoice.getNetAmount().subtract(paid).max(BigDecimal.ZERO);

        addTotalRow(table, "Subtotal:",     formatAmount(invoice.getTotalAmount()), false);
        addTotalRow(table, "Discount:",     formatAmount(invoice.getDiscount()),    false);
        addTotalRow(table, "Net Amount:",   formatAmount(invoice.getNetAmount()),   true);
        addTotalRow(table, "Paid:",         formatAmount(paid),                     false);
        addTotalRow(table, "Balance Due:",  formatAmount(balance),                  true);

        doc.add(table);
    }

    private void addPaymentsSection(Document doc, List<Payment> payments)
            throws DocumentException {
        doc.add(new Paragraph("Payment History", bold()));
        doc.add(new Paragraph(" "));

        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setWidths(new float[]{2f, 1.5f, 1.5f, 1f});

        addTableHeader(table, "Date");
        addTableHeader(table, "Method");
        addTableHeader(table, "Reference");
        addTableHeader(table, "Amount");

        for (Payment p : payments) {
            addTableCell(table, p.getPaidAt().format(DATETIME_FMT), WHITE, Element.ALIGN_LEFT);
            addTableCell(table, p.getPaymentMethod().name(),         WHITE, Element.ALIGN_LEFT);
            addTableCell(table, p.getReferenceNumber() != null
                    ? p.getReferenceNumber() : "-",                  WHITE, Element.ALIGN_LEFT);
            addTableCell(table, formatAmount(p.getAmountPaid()),     WHITE, Element.ALIGN_RIGHT);
        }

        doc.add(table);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private void addTableHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, boldWhite()));
        cell.setBackgroundColor(HEADER_COLOR);
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        cell.setBorderColor(WHITE);
        table.addCell(cell);
    }

    private void addTableCell(PdfPTable table, String text,
                              Color bg, int alignment) {
        PdfPCell cell = new PdfPCell(new Phrase(text, small()));
        cell.setBackgroundColor(bg);
        cell.setPadding(5);
        cell.setHorizontalAlignment(alignment);
        table.addCell(cell);
    }

    private void addTotalRow(PdfPTable table, String label,
                             String value, boolean highlight) {
        Color bg = highlight ? HEADER_COLOR : WHITE;
        Font f   = highlight ? boldWhite() : normal();

        PdfPCell labelCell = new PdfPCell(new Phrase(label, f));
        labelCell.setBackgroundColor(bg);
        labelCell.setPadding(5);
        labelCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(labelCell);

        PdfPCell valueCell = new PdfPCell(new Phrase(value, f));
        valueCell.setBackgroundColor(bg);
        valueCell.setPadding(5);
        valueCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(valueCell);
    }

    private String formatAmount(BigDecimal amount) {
        return amount != null
                ? String.format("%.2f", amount)
                : "0.00";
    }
}