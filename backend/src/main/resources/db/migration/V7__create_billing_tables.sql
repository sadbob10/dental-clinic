CREATE TABLE invoices (
                          id             BIGSERIAL     PRIMARY KEY,
                          patient_id     BIGINT        NOT NULL REFERENCES patients(id),
                          appointment_id BIGINT        REFERENCES appointments(id),
                          status         VARCHAR(20)   NOT NULL DEFAULT 'DRAFT',
                          total_amount   DECIMAL(10,2) NOT NULL DEFAULT 0,
                          discount       DECIMAL(10,2) NOT NULL DEFAULT 0,
                          net_amount     DECIMAL(10,2) NOT NULL DEFAULT 0,
                          notes          TEXT,
                          issued_at      TIMESTAMP,
                          due_date       TIMESTAMP,
                          created_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
                          updated_at     TIMESTAMP     NOT NULL DEFAULT NOW(),
                          created_by     VARCHAR(255)
);

CREATE TABLE invoice_items (
                               id          BIGSERIAL     PRIMARY KEY,
                               invoice_id  BIGINT        NOT NULL REFERENCES invoices(id),
                               description VARCHAR(255)  NOT NULL,
                               quantity    INT           NOT NULL DEFAULT 1,
                               unit_price  DECIMAL(10,2) NOT NULL,
                               subtotal    DECIMAL(10,2) NOT NULL
);

CREATE TABLE payments (
                          id               BIGSERIAL     PRIMARY KEY,
                          invoice_id       BIGINT        NOT NULL REFERENCES invoices(id),
                          amount_paid      DECIMAL(10,2) NOT NULL,
                          payment_method   VARCHAR(30)   NOT NULL,
                          paid_at          TIMESTAMP     NOT NULL DEFAULT NOW(),
                          reference_number VARCHAR(100),
                          notes            TEXT
);

CREATE INDEX idx_invoices_patient_id     ON invoices(patient_id);
CREATE INDEX idx_invoices_status         ON invoices(status);
CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_payments_invoice_id     ON payments(invoice_id);