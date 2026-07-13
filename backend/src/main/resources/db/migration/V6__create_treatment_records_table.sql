CREATE TABLE treatment_records (
                                   id               BIGSERIAL PRIMARY KEY,
                                   patient_id       BIGINT    NOT NULL REFERENCES patients(id),
                                   appointment_id   BIGINT    REFERENCES appointments(id),
                                   dentist_id       BIGINT    NOT NULL REFERENCES users(id),
                                   diagnosis        TEXT,
                                   treatment_done   TEXT      NOT NULL,
                                   prescription     TEXT,
                                   next_visit_notes TEXT,
                                   created_at       TIMESTAMP NOT NULL DEFAULT NOW(),
                                   updated_at       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_treatment_records_patient_id     ON treatment_records(patient_id);
CREATE INDEX idx_treatment_records_appointment_id ON treatment_records(appointment_id);
CREATE INDEX idx_treatment_records_dentist_id     ON treatment_records(dentist_id);