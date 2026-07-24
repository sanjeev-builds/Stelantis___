"""Points the app at a throwaway SQLite file instead of the real backend/app.db,
so running the test suite never touches (or reseeds/corrupts) the live demo
database. Must set env vars before any `app.*` module is imported anywhere -
app/db/session.py builds its engine at import time - so this happens at
conftest module scope, not inside a fixture.
"""

import os
import tempfile

_tmp_db_fd, _tmp_db_path = tempfile.mkstemp(suffix=".db")
os.close(_tmp_db_fd)
os.environ["DATABASE_URL"] = f"sqlite:///{_tmp_db_path}"
os.environ.setdefault("JWT_SECRET", "test-only-secret-not-used-in-prod")
os.environ.setdefault("GROQ_API_KEY", "")

import pytest  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _cleanup_test_db():
    yield
    try:
        os.remove(_tmp_db_path)
    except OSError:
        pass
