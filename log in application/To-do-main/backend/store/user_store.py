"""
User store module for the fullstack-todo-app backend.

Provides an in-memory dictionary-backed store that maps usernames to their
bcrypt-hashed passwords.  The store is designed for single-threaded use and
can be swapped for a real database layer without changing the service layer.
"""


class UserStore:
    """In-memory store that maps usernames to hashed passwords.

    The underlying data structure is a plain ``dict[str, str]`` that lives
    for the lifetime of the store instance.  Callers are responsible for
    hashing passwords *before* passing them to :meth:`add`; this class
    deliberately has no knowledge of the hashing algorithm.

    Example usage::

        store = UserStore()
        store.add("alice", "$2b$12$hashed...")
        store.get_hash("alice")   # "$2b$12$hashed..."
        store.exists("alice")     # True
        store.exists("bob")       # False
    """

    def __init__(self) -> None:
        """Initialise an empty user store."""
        self._users: dict[str, str] = {}

    # ------------------------------------------------------------------
    # Write operations
    # ------------------------------------------------------------------

    def add(self, username: str, hashed: str) -> None:
        """Store *hashed* as the credential for *username*.

        If an entry for *username* already exists it is silently overwritten.
        Callers that need to prevent duplicate registrations should check
        :meth:`exists` before calling this method.

        Args:
            username: The unique key identifying the user account.
            hashed:   The pre-hashed password string to store.
        """
        self._users[username] = hashed

    # ------------------------------------------------------------------
    # Read operations
    # ------------------------------------------------------------------

    def get_hash(self, username: str) -> str | None:
        """Return the stored hash for *username*, or ``None`` if not found.

        Args:
            username: The username whose hash should be retrieved.

        Returns:
            The hashed password string if the user exists, otherwise ``None``.
        """
        return self._users.get(username)

    def exists(self, username: str) -> bool:
        """Return ``True`` if *username* is present in the store.

        Args:
            username: The username to look up.

        Returns:
            ``True`` when the username has been added, ``False`` otherwise.
        """
        return username in self._users
