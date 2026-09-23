from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class EmailToken(Base):
    __tablename__ = "email_tokens"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    token_hash = Column(String(64), nullable=False, index=True)
    purpose = Column(String(30), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="email_tokens")

    __table_args__ = (
        Index("idx_email_tokens_user_id", "user_id"),
        Index("idx_email_tokens_token_hash", "token_hash"),
        Index("idx_email_tokens_purpose", "purpose"),
    )

    def __repr__(self) -> str:
        return f"<EmailToken user_id={self.user_id} purpose={self.purpose}>"
