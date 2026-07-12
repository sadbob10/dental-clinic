CREATE TABLE patients (
                          id                BIGSERIAL    PRIMARY KEY,
                          full_name         VARCHAR(255) NOT NULL,
                          date_of_birth     DATE,
                          gender            VARCHAR(10),
                          phone             VARCHAR(20)  NOT NULL UNIQUE,
                          email             VARCHAR(255),
                          address           TEXT,
                          emergency_contact VARCHAR(255),
                          medical_notes     TEXT,
                          is_deleted        BOOLEAN      NOT NULL DEFAULT FALSE,
                          created_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
                          updated_at        TIMESTAMP    NOT NULL DEFAULT NOW(),
                          created_by        VARCHAR(255)
);