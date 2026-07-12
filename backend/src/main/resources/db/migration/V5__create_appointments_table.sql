CREATE TABLE appointments (
                              id               BIGSERIAL   PRIMARY KEY,
                              patient_id       BIGINT      NOT NULL REFERENCES patients(id),
                              dentist_id       BIGINT      NOT NULL REFERENCES users(id),
                              scheduled_at     TIMESTAMP   NOT NULL,
                              duration_minutes INT         NOT NULL DEFAULT 30,
                              status           VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
                              type             VARCHAR(30) NOT NULL,
                              notes            TEXT,
                              deleted          BOOLEAN     NOT NULL DEFAULT FALSE,
                              created_at       TIMESTAMP   NOT NULL DEFAULT NOW(),
                              updated_at       TIMESTAMP   NOT NULL DEFAULT NOW(),
                              created_by       VARCHAR(255)
);

CREATE INDEX idx_appointments_patient_id   ON appointments(patient_id);
CREATE INDEX idx_appointments_dentist_id   ON appointments(dentist_id);
CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
CREATE INDEX idx_appointments_status       ON appointments(status);