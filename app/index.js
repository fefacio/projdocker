const express = require('express')
const bodyParser = require('body-parser')

const mysql = require('mysql2/promise');

// DATABASE SCRIPTS
// DATABASE SCRIPTS



// ROUTES IMPORT
const homepage = require('./routes/homepage');
const about = require('./routes/about')
const contact = require('./routes/contact')

// APP
const app = express();
const port = 3000;

console.log("Current directory:", __dirname);
app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.static(__dirname+'/public'))

//BODYPARSER
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ROUTES
app.use('/', homepage);
app.use('/sobre',about);
app.use('/contato',contact);

async function startApp() {
  try {
    // Establish a database connection
    const dbConnection = await mysql.createConnection({
      host: 'projnode1-db',        // Use the correct hostname or IP address
      user: 'root',                  // Replace with your MySQL username
      password: 'fernando123',       // Replace with your MySQL password
      database: 'apartment',         // Replace with the name of your MySQL database
    });
    console.log('Connected to the database');

    // Execute database scripts after the connection is established
    const createTable = require('./database/db_create'); // Create table
    await createTable(dbConnection);


    const feedTable = require('./database/db_feed'); // Check/insert data
    await feedTable(dbConnection);

    // Start the Express application
    app.listen(port, () => {
      console.log(`Executando na porta: ${port}`);
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// Call the async function to start the application
startApp();
