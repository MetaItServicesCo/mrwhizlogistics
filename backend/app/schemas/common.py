from typing import Generic, List, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Reusable paginated list response used across all admin list endpoints."""
    items: List[T]
    total: int
    page: int
    size: int