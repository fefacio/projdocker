// const mysql = require('mysql2/promise')

// const createResidenceQuery = `
//   CREATE TABLE IF NOT EXISTS residence (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     area SMALLINT,
//     bedroom TINYINT,
//     restroom TINYINT,
//     carParking TINYINT,
//     propertyPrice INT,
//     condoPrice SMALLINT
//   )
// `;

// connection.query(createResidenceQuery, (err, results) => {
//   if (err) {
//     console.error('Error creating table:', err);
//   } else {
//     console.log('Table created successfully or already exists');
//   }
// });

async function createTable(connection) {
  try {
    // Define your createResidenceQuery here
    const createResidenceQuery = `
      CREATE TABLE IF NOT EXISTS residence (
        id INT AUTO_INCREMENT PRIMARY KEY,
        area SMALLINT,
        bedroom TINYINT,
        restroom TINYINT,
        carParking TINYINT,
        propertyPrice INT,
        condoPrice SMALLINT
      )
    `;

    // Execute the create table query
    const [rows, fields] = await connection.execute(createResidenceQuery);
    console.log('Table created successfully or already exists');
    
  } catch (err) {
    console.error('Error creating table:', err);
  }
}

module.exports = createTable;


