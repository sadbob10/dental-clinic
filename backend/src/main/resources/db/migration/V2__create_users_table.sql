CREATE TABLE users (
                       id         BIGSERIAL    PRIMARY KEY,
                       email      VARCHAR(255) NOT NULL UNIQUE,
                       password   VARCHAR(255) NOT NULL,
                       full_name  VARCHAR(255) NOT NULL,
                       role       VARCHAR(50)  NOT NULL,
                       is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
                       created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
                       updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Default admin user
-- Plain password: Admin@1234
INSERT INTO users (email, password, full_name, role)
VALUES (
           'admin@dentalclinic.com',
           '$2a$12$tQvoYpqAKbl6A/sSPBb9aOcAMBUGCLyBGYFGVIAGAf8YxNg.mYBpS',
           'System Admin',
           'ADMIN'
       );