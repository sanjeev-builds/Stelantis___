# SQL / Database Prompts

## Design a new table
```
Add a SQLAlchemy model for [entity] to backend/app/db/models.py following
the VehicleTelemetry pattern (Mapped[] columns, __tablename__). Fields:
[list fields + types]. Relationships to existing tables: [describe, if any].
```

## Write a query
```
Using SQLAlchemy's ORM (see app/db/session.py for the session pattern),
write a query that [describe result needed] from [table(s)]. Return it
as a function I can call from a route in app/api/routes/.
```

## Debug a query result
```
This query returns [wrong result]: [paste query/code]. Expected: [describe].
Table schema: [paste model]. Sample data: [paste 2-3 rows]. Find why before fixing.
```
