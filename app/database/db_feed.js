const puppeteer = require('puppeteer');
const mysql = require('mysql2/promise');

// Url has Campinas and Ap for rent for filter
const baseUrl = 'https://www.vivareal.com.br/aluguel/sp/campinas/apartamento_residencial/#onde=Brasil,São%20Paulo,Campinas,,,,,,BR%3ESao%20Paulo%3ENULL%3ECampinas,,,';

// Coleta de dados com Puppeteer daqui para baixo:
async function feedTable(connection){
  try {
    const scrapeWebsite = async (connection) => {
      console.log("Conectando a pagina");
      const browser = await puppeteer.launch({ 
        executablePath: '/usr/bin/chromium-browser',
        headless: true, 
        args: ['--no-sandbox', '--headless', '--disable-gpu', '--disable-dev-shm-usage']
      });
      const page = await browser.newPage();
      console.log("Coletando dados da pagina");
    
      // await page.goto(baseUrl, );
    
      // Obtenha o número total de resultados e a média de resultados por página
      // const totalResultsElement = await page.waitForSelector('.js-total-records');
      // const totalResultsText = await page.evaluate(element => element.textContent, totalResultsElement);
      // const totalResults = parseInt(totalResultsText.replace(/\D/g, '')); // Extrai apenas os dígitos
    
      const averageResultsPerPage = 37; // Média de resultados por página
      const totalPages = 10//Math.ceil(totalResults / averageResultsPerPage);
    
      const data = [];
    
      for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
        const url = `${baseUrl}&pagina=${currentPage}`;
        await page.goto(url, {timeout: 0});
    
        // Selecione e retorne os elementos de detalhes do imóvel
        const apartments = await page.evaluate(() => {
          const propertyCards = Array.from(document.querySelectorAll('.property-card__content'));
    
          return propertyCards.map(card => {
            const areaElement = card.querySelector('.js-property-card-detail-area');
            const bedroomElement = card.querySelector('.property-card__detail-room');
            const restroomElement = card.querySelector('.property-card__detail-bathroom');
            const carParkingElement = card.querySelector('.property-card__detail-garage');
            const propertyPriceElement = card.querySelector('.js-property-card__price-small');
            const condoPriceElement = card.querySelector('.js-condo-price');
    
            // Função para extrair números de uma string usando expressão regular
            const extractNumbers = (text) => {
              const matches = text.match(/\d+/g);
              return matches ? matches.join('') : null;
            };
    
            return {
              area: extractNumbers(areaElement ? areaElement.textContent.trim() : null),
              bedroom: extractNumbers(bedroomElement ? bedroomElement.textContent.trim() : null),
              restroom: extractNumbers(restroomElement ? restroomElement.textContent.trim() : null),
              carParking: extractNumbers(carParkingElement ? carParkingElement.textContent.trim() : null),
              propertyPrice: extractNumbers(propertyPriceElement ? propertyPriceElement.textContent.trim() : null),
              condoPrice: extractNumbers(condoPriceElement ? condoPriceElement.textContent.trim() : '')
            };
          });
        });
    
            
      // Adicione os dados desta página ao array de dados
      data.push(...apartments);
    
      // Aguarde um curto período para evitar sobrecarregar o servidor
      await new Promise(r => setTimeout(r, 1000));
      }
    
      await browser.close();
    
      // Chame a função para inserir os dados no MySQL
      await inserirDadosNoMySQL(data, connection);
    }
    
    const inserirDadosNoMySQL = async (data, onnection) => {
      console.log("Alimentando a base")
    
      // Query SQL para inserir dados na tabela
      const query = 'INSERT INTO residence (area, bedroom, restroom, carParking, propertyPrice, condoPrice) VALUES (?, ?, ?, ?, ?, ?)';
      
      // Iterar sobre os dados e inserir cada objeto individualmente
      for (const apartment of data) {
        const values = [
          apartment.area,
          apartment.bedroom,
          apartment.restroom,
          apartment.carParking,
          apartment.propertyPrice,
          apartment.condoPrice
        ];
        try {
          const [results] = await connection.execute(query, values);
        } catch (error) {
          console.error('Error inserting:', error);
        }
        
      }
    }

    const main = async (connection) => {
      try {
        const [results] = await connection.execute('SELECT COUNT(*) AS count FROM residence');
        const rowCount = results[0].count;

        if (rowCount === 0) {
          console.log('Tabela vazia');
          await scrapeWebsite(connection);
          console.log('Tabela alimentada com sucesso');
        } else {
          console.log('Tabela já contém valores');
        }
        console.log('Rotinas de DB finalizadas.');
      } catch (error) {
        console.error('Error checking table:', error);
      }
    };
    
    await main(connection)

  } catch (error) {
    console.error('Error in feedTable:', error);
  }  
}

module.exports = feedTable;
