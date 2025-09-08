const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: "Paul", password: "1234" },
  { username: "Rick", password: "1234" },
  { username: "Carl", password: "1234" },
];

const isValid = (username) => {
  //returns boolean
  // returns true if the username does NOT already exist in users array
  return !users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  // Filter the users array for any user with the same username and password
  let userssamenamepassword = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userssamenamepassword.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }

  // Authenticate user
  if (authenticatedUser(username, password)) {
    // Generate JWT access token
    let accessToken = jwt.sign({ username: username }, "access", {
      expiresIn: 60 * 60,
    });

    // Store access token and username in session
    req.session.authorization = {
      accessToken,
      username,
    };
    console.log(users);

    console.log(
      "Session in login route after setting authorization:",
      req.session
    );

    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(401)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const isbn = req.params.isbn;
  // Get review from query or body (prefer body if you update your client)
  const review = req.body.review || req.query.reviews;
  // Get username from session
  const username = req.session.authorization?.username;

  console.log("Session in review route:", req.session);

  // Find the book by ISBN
  const book = Object.values(books).find((b) => b.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }
  if (!review) {
    return res.status(400).json({ message: "Review text required" });
  }

  // Add or update the review
  book.reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: book.reviews,
  });
});

module.exports.authenticatedUser = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
