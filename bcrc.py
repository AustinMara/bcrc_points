"""CLI for adding to the BCRC points database on Turso.

Connection:
  Set TURSO_DATABASE_URL (libsql://...) and TURSO_AUTH_TOKEN to use Turso.
  If TURSO_DATABASE_URL is unset, the local SQLite file in BCRC_LOCAL_DB
  (default: bcrcpoints.db) is used instead, which is handy for testing.
"""

import hashlib
import os
from pathlib import Path
import random
import secrets
import sqlite3

import click

# The table definitions live in one file, shared with the web app's demo database.
SCHEMA_FILE = Path(__file__).parent / "web" / "server" / "database" / "schema.sql"

PBKDF2_ITERATIONS = 600_000


def get_conn():
    url = os.environ.get("TURSO_DATABASE_URL")
    if url:
        try:
            import libsql
        except ImportError:
            raise click.ClickException("TURSO_DATABASE_URL is set but 'libsql' isn't installed: pip install libsql")
        token = os.environ.get("TURSO_AUTH_TOKEN")
        if not token:
            raise click.ClickException("TURSO_AUTH_TOKEN is not set")
        return libsql.connect(url, auth_token=token)
    return sqlite3.connect(os.environ.get("BCRC_LOCAL_DB", "bcrcpoints.db"))


def hash_password(password: str) -> str:
    """Format: pbkdf2_sha256$<iterations>$<salt hex>$<hash hex>"""
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt.hex()}${digest.hex()}"


def print_rows(cur):
    cols = [d[0] for d in cur.description]
    rows = cur.fetchall()
    if not rows:
        click.echo("(no rows)")
        return
    widths = [max(len(str(c)), *(len(str(r[i])) for r in rows)) for i, c in enumerate(cols)]
    click.echo("  ".join(str(c).ljust(w) for c, w in zip(cols, widths)))
    click.echo("  ".join("-" * w for w in widths))
    for r in rows:
        click.echo("  ".join(("" if v is None else str(v)).ljust(w) for v, w in zip(r, widths)))


@click.group()
def cli():
    """BCRC points tracking database tool."""


@cli.command("init")
def init_db():
    """Create the tables if they don't exist."""
    conn = get_conn()
    for statement in SCHEMA_FILE.read_text().split(";"):
        if statement.strip():
            conn.execute(statement)
    conn.commit()
    click.echo("Schema ready.")


@cli.command("add-student")
@click.argument("first_name")
@click.argument("last_name")
@click.option("--points", default=0, show_default=True, help="Starting point total.")
def add_student(first_name, last_name, points):
    """Add a student."""
    conn = get_conn()
    cur = conn.execute(
        "INSERT INTO Students (first_name, last_name, points) VALUES (?, ?, ?)",
        (first_name, last_name, points),
    )
    conn.commit()
    click.echo(f"Added student {first_name} {last_name} (id {cur.lastrowid}).")


@cli.command("add-instructor")
@click.argument("username")
@click.option("--name", help="Display name.")
@click.password_option(help="Prompted for if omitted.")
def add_instructor(username, name, password):
    """Add an instructor (password is hashed with PBKDF2-SHA256)."""
    conn = get_conn()
    try:
        cur = conn.execute(
            "INSERT INTO Instructors (username, name, hashed_password) VALUES (?, ?, ?)",
            (username, name, hash_password(password)),
        )
        conn.commit()
    except Exception as e:
        if "UNIQUE" in str(e):
            raise click.ClickException(f"Username '{username}' already exists")
        raise
    click.echo(f"Added instructor {username} (id {cur.lastrowid}).")


@cli.command("add-points", context_settings={"ignore_unknown_options": True})
@click.argument("student_id", type=int)
@click.argument("value", type=int)
@click.option("--reason", "-r", default="", help="Reason (max 64 chars).")
def add_points(student_id, value, reason):
    """Award (or, with a negative VALUE, deduct) points for a student."""
    if len(reason) > 64:
        raise click.ClickException("Reason must be 64 characters or fewer")
    conn = get_conn()
    row = conn.execute(
        "SELECT first_name, last_name FROM Students WHERE id = ?", (student_id,)
    ).fetchone()
    if row is None:
        raise click.ClickException(f"No student with id {student_id}")
    conn.execute(
        "INSERT INTO Points (student_id, points_reason, points_value) VALUES (?, ?, ?)",
        (student_id, reason, value),
    )
    conn.execute(
        "UPDATE Students SET points = COALESCE(points, 0) + ? WHERE id = ?",
        (value, student_id),
    )
    conn.commit()
    total = conn.execute("SELECT points FROM Students WHERE id = ?", (student_id,)).fetchone()[0]
    click.echo(f"{value:+d} points for {row[0]} {row[1]}. New total: {total}.")


FAKE_FIRST_NAMES = ["Ava", "Ben", "Chloe", "Diego", "Ella", "Finn", "Grace", "Hugo", "Isla", "Jack",
                    "Kai", "Luna", "Mason", "Nora", "Owen", "Priya", "Quinn", "Ruby", "Sam", "Tara"]
FAKE_LAST_NAMES = ["Adams", "Brooks", "Chen", "Davis", "Evans", "Garcia", "Hill", "Ito", "Johnson", "Kim",
                   "Lopez", "Miller", "Nguyen", "Patel", "Reed", "Smith", "Turner", "Walker", "Young", "Zhou"]
FAKE_REASONS = ["Practice", "Meet", "Helped clean up", "Volunteered", "Good sportsmanship", "Late"]


@cli.command("seed")
@click.option("--count", default=40, show_default=True, help="How many fake students to add.")
def seed(count):
    """Add fake students with some points history, for testing."""
    if os.environ.get("TURSO_DATABASE_URL"):
        click.confirm("This writes fake students to Turso, not the local file. Continue?", abort=True)

    conn = get_conn()
    for _ in range(count):
        first, last = random.choice(FAKE_FIRST_NAMES), random.choice(FAKE_LAST_NAMES)
        awards = [random.choice([50, 50, 10, 5, 1, -1]) for _ in range(random.randint(0, 5))]
        cur = conn.execute(
            "INSERT INTO Students (first_name, last_name, points) VALUES (?, ?, ?)",
            (first, last, sum(awards)),
        )
        for value in awards:
            conn.execute(
                "INSERT INTO Points (student_id, points_reason, points_value) VALUES (?, ?, ?)",
                (cur.lastrowid, "Late" if value < 0 else random.choice(FAKE_REASONS[:-1]), value),
            )
    conn.commit()
    click.echo(f"Added {count} fake students.")


@cli.command("list")
@click.argument("table", type=click.Choice(["students", "instructors", "points"], case_sensitive=False))
def list_table(table):
    """Print a table (instructor password hashes are hidden)."""
    queries = {
        "students": "SELECT id, first_name, last_name, points FROM Students ORDER BY last_name, first_name",
        "instructors": "SELECT id, username, name, favorites FROM Instructors ORDER BY id",
        "points": """SELECT p.id, p.student_id, s.first_name || ' ' || s.last_name AS student,
                            p.points_value, p.points_reason
                     FROM Points p LEFT JOIN Students s ON s.id = p.student_id ORDER BY p.id""",
    }
    print_rows(get_conn().execute(queries[table.lower()]))


if __name__ == "__main__":
    cli()
