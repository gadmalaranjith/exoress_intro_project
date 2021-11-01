const express = require("express");
const { open } = require("sqlite");

const path = require("path");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "goodreads.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`DB Error${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();
//get books API
app.get("/books", (request, response) => {
  const getBookQuery = `
    SELECT
        *
    FROM
        book
    ORDER BY
        book_id;    
    `;
  const bookArray = db.all(getBookQuery);
  response.send(bookArray);
});
// get book API
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const getBookQuery = `
    SELECT
        *
    FROM
        book
    WHERE
        book_id = ${bookId};`;
  const book = await db.get(getBookQuery);
  response.send(book);
});
// Add book API
app.post("/books/", async (request, response) => {
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;
  const dbResponse = await db.run(addBookQuery);
  const bookId = dbResponse.lastID;
  response.send({ bookID: bookId });
});

//update book details

app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const bookDetails = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = bookDetails;
  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`;
  await db.run(updateBookQuery);
  response.send("Book successfully updated");
});

// delete book ID
app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const deleteBookId = `
    DELETE FROM
        book
    WHERE 
        book_id =${bookId};    
    `;
  await db.run(deleteBookId);
  response.send("Book successfully deleted");
});

//get author books
app.get("/authors/:authorId/books/", async (request, response) => {
  const { authorId } = request.params;
  const getAuthorBooksQuery = `
    SELECT
    *
    FROM
        book
    WHERE
        author_id = ${authorId};`;
  const booksArray = await db.all(getAuthorBooksQuery);
  response.send(booksArray);
});
