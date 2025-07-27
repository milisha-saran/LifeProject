"""Add recurring items (chores and habits)

Revision ID: 5ed197308e1d
Revises: 3351b4752373
Create Date: 2025-07-27 10:59:33.818628

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '5ed197308e1d'
down_revision: Union[str, Sequence[str], None] = '3351b4752373'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Create the frequency type enum first
    frequency_enum = postgresql.ENUM('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM', name='frequencytype')
    frequency_enum.create(op.get_bind(), checkfirst=True)

    
    # Create chore table using existing taskstatus enum
    op.create_table('chore',
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
    sa.Column('description', sqlmodel.sql.sqltypes.AutoString(length=1000), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('start_time', sa.DateTime(), nullable=True),
    sa.Column('end_time', sa.DateTime(), nullable=True),
    sa.Column('eta_hours', sa.Float(), nullable=True),
    sa.Column('status', postgresql.ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', name='taskstatus', create_type=False), nullable=False),
    sa.Column('frequency_type', postgresql.ENUM('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM', name='frequencytype', checkfirst=True, create_type=False), nullable=False),
    sa.Column('frequency_value', sa.Integer(), nullable=False),
    sa.Column('next_due_date', sa.Date(), nullable=False),
    sa.Column('last_completed_date', sa.Date(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_chore_name'), 'chore', ['name'], unique=False)
    op.create_index(op.f('ix_chore_user_id'), 'chore', ['user_id'], unique=False)
    
    # Create habit table using existing taskstatus enum
    op.create_table('habit',
    sa.Column('created_at', sa.DateTime(), nullable=False),
    sa.Column('updated_at', sa.DateTime(), nullable=True),
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
    sa.Column('description', sqlmodel.sql.sqltypes.AutoString(length=1000), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('start_time', sa.DateTime(), nullable=True),
    sa.Column('end_time', sa.DateTime(), nullable=True),
    sa.Column('eta_hours', sa.Float(), nullable=True),
    sa.Column('status', postgresql.ENUM('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', name='taskstatus', create_type=False), nullable=False),
    sa.Column('frequency_type', postgresql.ENUM('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM', name='frequencytype', checkfirst=True, create_type=False), nullable=False),
    sa.Column('frequency_value', sa.Integer(), nullable=False),
    sa.Column('next_due_date', sa.Date(), nullable=False),
    sa.Column('last_completed_date', sa.Date(), nullable=True),
    sa.Column('streak_count', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_habit_name'), 'habit', ['name'], unique=False)
    op.create_index(op.f('ix_habit_user_id'), 'habit', ['user_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop tables
    op.drop_index(op.f('ix_habit_user_id'), table_name='habit')
    op.drop_index(op.f('ix_habit_name'), table_name='habit')
    op.drop_table('habit')
    op.drop_index(op.f('ix_chore_user_id'), table_name='chore')
    op.drop_index(op.f('ix_chore_name'), table_name='chore')
    op.drop_table('chore')
    
    # Drop the frequency enum
    frequency_enum = sa.Enum('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'CUSTOM', name='frequencytype')
    frequency_enum.drop(op.get_bind(), checkfirst=True)
