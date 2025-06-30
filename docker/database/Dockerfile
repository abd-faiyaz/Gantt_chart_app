# Use official PostgreSQL 15 image
FROM postgres:15-alpine

# Set environment variables
ENV POSTGRES_DB=gantt_project_db
ENV POSTGRES_USER=gantt_user
ENV POSTGRES_PASSWORD=gantt_password

# Create init directory and copy initialization scripts
COPY docker/database/init/ /docker-entrypoint-initdb.d/

# Set proper permissions for init scripts
RUN chmod -R 755 /docker-entrypoint-initdb.d/

# Expose PostgreSQL port
EXPOSE 5432

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD pg_isready -U $POSTGRES_USER -d $POSTGRES_DB
