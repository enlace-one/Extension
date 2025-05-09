-- SQL Data Types:
-- INT: An integer
-- DECIMAL(M,N): A decimal number
-- VARCHAR(N): A string with a maximum length of N
-- TEXT: A string with no specified maximum length
-- DATE: A date

-- Creating Tables:
/*
CREATE TABLE table_name (
    column1 datatype,
    column2 datatype,
    ...
);
*/

-- Inserting Data:
/*
INSERT INTO table_name (column1, column2, ...)
VALUES (value1, value2, ...);
*/

-- Selecting Data:
/*
SELECT column1, column2, ...
FROM table_name;
*/

-- Where Clause:
/*
SELECT column1, column2, ...
FROM table_name
WHERE condition;
*/

-- Updating Data:
/*
UPDATE table_name
SET column1 = value1, column2 = value2, ...
WHERE condition;
*/

-- Deleting Data:
/*
DELETE FROM table_name WHERE condition;
*/

-- Order By:
/*
SELECT column1, column2, ...
FROM table_name
ORDER BY column1 [ASC|DESC], column2 [ASC|DESC], ...;
*/

-- Group By:
/*
SELECT column1, COUNT(column2)
FROM table_name
GROUP BY column1;
*/

-- Joining Tables:
/*
SELECT column_name(s)
FROM table1
[INNER|LEFT|RIGHT|FULL] JOIN table2
ON table1.column_name = table2.column_name;
*/

-- Aggregate Functions:
-- COUNT(column): Returns the number of rows that matches a specified criteria
-- SUM(column): Returns the total sum of a numeric column
-- AVG(column): Returns the average value of a numeric column
-- MIN(column): Returns the smallest value of the selected column
-- MAX(column): Returns the largest value of the selected column

-- MySQL:
/*
-- Get tables
SHOW TABLES;

-- Get table comments
SELECT TABLE_NAME, TABLE_COMMENT 
FROM INFORMATION_SCHEMA.TABLES
WHERE TABLE_SCHEMA = 'your_database_name';
*/

-- PostgreSQL:
/*
-- Get tables
SELECT tablename 
FROM pg_catalog.pg_tables 
WHERE schemaname != 'pg_catalog' AND schemaname != 'information_schema';

-- Get table comments
SELECT c.relname AS table_name, 
       pg_catalog.obj_description(c.oid) AS table_comment
FROM pg_catalog.pg_class c
LEFT JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind = 'r' AND n.nspname NOT IN ('pg_catalog', 'information_schema')
      AND pg_catalog.pg_table_is_visible(c.oid);
*/

-- Oracle:
/*
-- Get tables
SELECT table_name 
FROM user_tables;

-- Get table comments
SELECT table_name, comments 
FROM user_tab_comments;
*/

-- SQL Server:
/*
-- Get tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_type = 'base table';

-- Get table comments
EXEC sp_MSforeachtable @command1 = "PRINT '?' EXEC sp_addextendedproperty @name = N'MS_Description', @value = 'Table description here' , @level0type = N'SCHEMA', @level0name = 'dbo', @level1type = N'TABLE', @level1name = ?";
*/

Source: GitHub Copilot