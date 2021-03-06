-- pg_ctl -D -- START THE SERVER
-- psql \q NAME -- CREATE DB
-- psql -d DATABASE-NAME -f books.sql -- ADD THE FILE DATA(TABLE) TO DATABASE
-- createdb NAME -- create a new db from the command line, NOT executed from within psql


DROP TABLE books;

CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
  isbn VARCHAR(255),
  image_url VARCHAR(255),
  book_desc TEXT
);

-- psql -d books_app -f data/books.sql;
-- psql -d books_app -f data/seed.sql;
