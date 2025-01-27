CREATE DATABASE IF NOT EXISTS gsag_be_task;

CREATE TYPE IF NOT EXISTS status_enum AS ENUM ('in_progress', 'done');

CREATE TABLE
    IF NOT EXISTS task (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority INTEGER NOT NULL,
        status status_enum DEFAULT 'in_progress'::status_enum NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        CONSTRAINT check_priority CHECK (priority BETWEEN 0 AND 2)
    );

CREATE TABLE
    IF NOT EXISTS user (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

CREATE TABLE
    IF NOT EXISTS user_tasks (
        user_id INTEGER REFERENCES user (id) ON DELETE CASCADE,
        task_id INTEGER REFERENCES task (id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, task_id)
    );
