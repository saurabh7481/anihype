const Sequelize = require('sequelize');

const sequelize = new Sequelize('node_intro', 'root', 'Zeus@007', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;
