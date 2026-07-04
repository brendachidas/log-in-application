"""Unit tests for backend/store/user_store.py.

These tests cover the CRUD operations on the in-memory UserStore and verify
that the documented behaviour holds for concrete examples and important edge
cases (empty strings, overwrite, missing keys).
"""

import pytest

from store.user_store import UserStore


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture()
def store() -> UserStore:
    """Return a fresh, empty UserStore for each test."""
    return UserStore()


# ---------------------------------------------------------------------------
# add / exists
# ---------------------------------------------------------------------------


def test_add_then_exists(store: UserStore) -> None:
    store.add("alice", "hashed_pw")
    assert store.exists("alice") is True


def test_exists_returns_false_for_unknown_user(store: UserStore) -> None:
    assert store.exists("nobody") is False


def test_add_multiple_users_all_exist(store: UserStore) -> None:
    store.add("alice", "hash_a")
    store.add("bob", "hash_b")
    store.add("carol", "hash_c")
    assert store.exists("alice") is True
    assert store.exists("bob") is True
    assert store.exists("carol") is True


def test_exists_is_case_sensitive(store: UserStore) -> None:
    store.add("Alice", "hash")
    assert store.exists("alice") is False
    assert store.exists("ALICE") is False
    assert store.exists("Alice") is True


# ---------------------------------------------------------------------------
# get_hash
# ---------------------------------------------------------------------------


def test_get_hash_returns_stored_value(store: UserStore) -> None:
    store.add("alice", "$2b$12$somehash")
    assert store.get_hash("alice") == "$2b$12$somehash"


def test_get_hash_returns_none_for_unknown_user(store: UserStore) -> None:
    assert store.get_hash("ghost") is None


def test_get_hash_does_not_equal_plaintext(store: UserStore) -> None:
    """Sanity-check: caller is expected to pass a hash, not plaintext."""
    plain = "secret"
    hashed = "$2b$12$nottheplaintext"
    store.add("bob", hashed)
    assert store.get_hash("bob") != plain


# ---------------------------------------------------------------------------
# Overwrite behaviour
# ---------------------------------------------------------------------------


def test_add_overwrites_existing_hash(store: UserStore) -> None:
    store.add("alice", "old_hash")
    store.add("alice", "new_hash")
    assert store.get_hash("alice") == "new_hash"


def test_overwrite_does_not_create_duplicate_entry(store: UserStore) -> None:
    store.add("alice", "hash1")
    store.add("alice", "hash2")
    # Still a single logical user — exists returns True, not some compound state
    assert store.exists("alice") is True


# ---------------------------------------------------------------------------
# Empty-string edge cases
# ---------------------------------------------------------------------------


def test_add_empty_username_stores_entry(store: UserStore) -> None:
    """The store itself does not validate; callers enforce non-empty fields."""
    store.add("", "hash")
    assert store.exists("") is True
    assert store.get_hash("") == "hash"


def test_add_empty_hash_stores_entry(store: UserStore) -> None:
    store.add("user", "")
    assert store.get_hash("user") == ""


# ---------------------------------------------------------------------------
# Isolation between instances
# ---------------------------------------------------------------------------


def test_two_store_instances_are_independent() -> None:
    s1 = UserStore()
    s2 = UserStore()
    s1.add("alice", "hash_a")
    assert s2.exists("alice") is False
    assert s2.get_hash("alice") is None
