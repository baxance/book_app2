'use strict';


//dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const app = express();
require('dotenv').config();

const PORT = process.env.PORT;
//middleware
app.use(express.static('./views'));
app.use(express.static('./public'));
app.use(express.urlencoded({extended:true}));
app.set('view engine', 'ejs');

// Set up the Database
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => console.error(err));

// Build the routes, callbacks
app.get('/', savedBooks);
app.get('/searches/new', searchForm);
app.post('/new', searchBooks);
app.get('/books/:id', bookDetail);
app.post('/books', saveBook);

// Create the callback functions
function savedBooks(req, res) {
  let SQL = 'SELECT * FROM  books;';
  client.query(SQL)
    .then(results => {
      let books = results.rows
      // console.log(books);
      res.render('pages/index', {output: books})
    })
    .catch(error => {
      res.status(300).send(error)
    });
};

function searchForm(req, res) {
  res.render('pages/searches/new.ejs')
}

function searchBooks(req, res) {
  const url = `https://www.googleapis.com/books/v1/volumes?q=in${req.body.type}:${req.body.inputText}`;
  superagent.get(url)
    .then(API => {
      const output = API.body.items.map((books) => {
        let results = new Library(books)
        // console.log(results)
        return results;
      });
      res.render('pages/searches/show.ejs', {output})
    })
    .catch(error => {
      res.status(300).send(error)
    });
}

function bookDetail(req, res) {
  console.log('in the bookDetail function');
  const SQL = 'SELECT * FROM books WHERE id=$1;';
  const id = req.params.id;
  const safeValues = [id];
  // console.log(values);
  // console.log(SQL)
  // console.log(req.body)
  return client.query(SQL, safeValues)
    .then(result => {
      const book = result.rows[0];
      res.render('pages/books/show.ejs', {data: book});
    })
}

function saveBook(req, res) {
  const SQL = `INSERT INTO books (author, title, isbn, image_url, book_desc) VALUES ($1, $2, $3, $4, $5) RETURNING id;`;
  const values = [req.body.author, req.body.title, req.body.isbn, req.body.image_url, req.body.book_desc];

  // return client.query(SQL, values)
  //     .then( () => {
  //       const SQL = 'SELECT * FROM books WHERE id=$1;';
        // const values = [req.body];
        console.log(values);
        console.log(SQL)
  
        client.query(SQL, values)
          .then(result => {
            let id = result.rows[0].id;
            console.log(result.rows[0], 'result')
            res.redirect(`/books/${id}`);
          }) .catch( (error) => {
            console.log(error)
          })
          
      // })
}

// Constructor
function Library (books) {
  this.image_url = (books.volumeInfo.imageLinks && books.volumeInfo.imageLinks.thumbnail) ? books.volumeInfo.imageLinks.thumbnail.replace(/http/i, 'https') : 'https://www.freeiconspng.com/uploads/book-icon--icon-search-engine-6.png';
  this.title = (books.volumeInfo && books.volumeInfo.title) ? books.volumeInfo.title : 'Nothing by this title found';
  this.author = (books.volumeInfo && books.volumeInfo.authors) ? books.volumeInfo.authors : 'Nothing by this Author found'; 
  this.book_desc = (books.volumeInfo && books.volumeInfo.description) ? books.volumeInfo.description : 'No description available';
  this.isbn = (books.volumeInfo && books.volumeInfo.industryIdentifiers) ? books.volumeInfo.industryIdentifiers[0].identifier : 'No description available';
};

client.connect()
  .then( () => {
    app.listen(PORT, () => console.log(`listening on port: ${PORT}`))
  })
