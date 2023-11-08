const { Router } = require('express');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const router = Router();

const sequelize = new Sequelize('apartment', 'root', 'fernando123', {
    host: 'projnode1-db',
    dialect: 'mysql',
});
  
//Defina o modelo do apartamento
const Imovel = sequelize.define('residence', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true, // Defina 'id' como chave primária
    },
    area: Sequelize.INTEGER,
    bedroom: Sequelize.INTEGER,
    restroom: Sequelize.INTEGER,
    carParking: Sequelize.INTEGER,
    propertyPrice: Sequelize.INTEGER,
    condoPrice: Sequelize.INTEGER,
  }, {
    tableName: 'residence',
  }
);

router.get('/', function(req, res) {
    //req.session.erroLogin = false;
    //req.session.returnTo = req.originalUrl;
    // res.render('index',{minAge:null, maxAge:null});
    res.render('homepage', {result:null, formData:null});
});

router.post('/estimar-aluguel', (req, res) => {
    const { area, bedroom, restroom, carParking, condoPrice } = req.body;
  
    // Calcular os valores mínimos e máximos para area e condoPrice com base na variação de 30%
    const minArea = area * 0.7;
    const maxArea = area * 1.3;
    const minCondoPrice = condoPrice * 0.7;
    const maxCondoPrice = condoPrice * 1.3;
  
    // Converter os valores para números
    const minAreaNumber = parseFloat(minArea);
    const maxAreaNumber = parseFloat(maxArea);
    const minCondoPriceNumber = parseFloat(minCondoPrice);
    const maxCondoPriceNumber = parseFloat(maxCondoPrice);
  
    // Execute a consulta no banco de dados para selecionar imóveis com base nos parâmetros
    Imovel.findAll({
      where: {
        area: {
          [Op.between]: [minAreaNumber, maxAreaNumber]
        },
        bedroom: bedroom,
        restroom: restroom,
        carParking: carParking,
        condoPrice: {
          [Op.between]: [minCondoPriceNumber, maxCondoPriceNumber]
        }
      },
      attributes: ['propertyPrice'], // Selecione apenas o campo 'propertyPrice'
    })
    .then((imoveis) => {
    // Realize o cálculo da estimativa de aluguel com base nos imóveis selecionados
        let estimativa = 0;
        if (imoveis.length > 0) {
            let totalPropertyPrice = 0;

            for (let i = 0; i < imoveis.length; i++) {
                totalPropertyPrice = totalPropertyPrice + imoveis[i].propertyPrice;
            }

            estimativa = totalPropertyPrice / imoveis.length;
            res.render('homepage',{result: estimativa.toFixed(2), formData: req.body });

        } else {
            // Caso nenhum imóvel seja encontrado, defina a estimativa como zero e exiba uma mensagem
            estimativa = 0;
            res.render('homepage', {result:null, formData: req.body});
        }
    })
});

module.exports = router;