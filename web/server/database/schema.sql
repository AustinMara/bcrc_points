-- The one definition of the BCRC points database.
-- Used by `python bcrc.py init` and by the web app's demo database.

CREATE TABLE IF NOT EXISTS `Instructors` (
    `id` integer PRIMARY KEY,
    `username` text NOT NULL UNIQUE,
    `name` text,
    `hashed_password` text NOT NULL,
    `favorites` integer
);

CREATE TABLE IF NOT EXISTS `Students` (
    `id` integer PRIMARY KEY,
    `first_name` text NOT NULL,
    `points` integer,
    `last_name` text NOT NULL,
    -- Random code for the student's public ledger link (/students/3f9a1c07be), so links
    -- can't be guessed by counting ids. The database fills it in on every new student.
    `public_code` text NOT NULL UNIQUE DEFAULT (lower(hex(randomblob(5))))
);

CREATE TABLE IF NOT EXISTS `Points` (
    `id` integer PRIMARY KEY,
    `student_id` integer,
    `points_reason` text(64),
    `points_value` integer NOT NULL,
    -- When the points were given, in UTC ("2026-11-15 18:30:00"), filled in by the database.
    -- Empty for points given before dates were recorded.
    `created_at` text DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS `student_uid` ON `Points` (`student_id`);

-- Each instructor's starred students, shown on their home page.
CREATE TABLE IF NOT EXISTS `Favorites` (
    `instructor_id` integer NOT NULL REFERENCES `Instructors` (`id`),
    `student_id` integer NOT NULL REFERENCES `Students` (`id`),
    PRIMARY KEY (`instructor_id`, `student_id`)
);
