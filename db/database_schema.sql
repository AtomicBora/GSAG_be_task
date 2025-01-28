CREATE DATABASE gsag_be_task;

\c gsag_be_task

CREATE TYPE status_enum AS ENUM ('in_progress', 'done');

CREATE TABLE
    IF NOT EXISTS gs_task (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority INTEGER NOT NULL,
        status status_enum DEFAULT 'in_progress'::status_enum NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        CONSTRAINT check_priority CHECK (priority BETWEEN 0 AND 2)
    );

CREATE TABLE
    IF NOT EXISTS gs_user (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS gs_user_task (
        gs_user_id INTEGER REFERENCES gs_user (id) ON DELETE CASCADE,
        gs_task_id INTEGER REFERENCES gs_task (id) ON DELETE CASCADE,
        PRIMARY KEY (gs_user_id, gs_task_id)
    );
