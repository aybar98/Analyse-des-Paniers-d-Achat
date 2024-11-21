const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const cors = require('cors');

// Autoriser toutes les origines (pour le développement uniquement)
app.use(cors());

// Ou, pour autoriser uniquement votre application Vue.js
app.use(
  cors({
    origin: 'http://localhost:8080', // Remplacez par l'origine de votre client
  })
);

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/mydb', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Définition des schémas MongoDB
const productSchema = new mongoose.Schema({
  ProductID: Number,
  ProductName: String,
  Category: String,
  Price: Number,
});

const saleSchema = new mongoose.Schema({
  SaleID: Number,
  ProductID: Number,
  Quantity: Number,
  Date: Date,
  TotalAmount: Number,
});

// Modèles MongoDB
const Product = mongoose.model('products', productSchema);
const Sale = mongoose.model('sales', saleSchema);





app.get('/analytics/total_sales', async (req, res) => {
    try {
      // Récupérer la période depuis les paramètres de la requête
      const period = req.query.period; // Options possibles : "7days", "30days", "12months"
  
      // Calculer la date de début en fonction de la période
      let startDate;
      const currentDate = new Date();
  
      switch (period) {
        case '7days':
          startDate = new Date(currentDate);
          startDate.setDate(currentDate.getDate() - 7); // 7 derniers jours
          break;
  
        case '30days':
          startDate = new Date(currentDate);
          startDate.setDate(currentDate.getDate() - 30); // 30 derniers jours
          break;
  
        case '12months':
          startDate = new Date(currentDate);
          startDate.setFullYear(currentDate.getFullYear() - 1); // 12 derniers mois
          break;
  
        default:
          return res.status(400).json({ error: 'Invalid period. Use "7days", "30days", or "12months".' });
      }
  
      // Agrégation MongoDB avec filtre par période
      const totalSales = await Sale.aggregate([
        {
          $match: { Date: { $gte: startDate } }, // Filtrer les ventes depuis la date de début
        },
        {
          $group: { _id: null, totalSales: { $sum: '$TotalAmount' } }, // Calculer le montant total
        },
      ]);
  
      // Retourner le montant total des ventes
      res.json({ totalSales: totalSales[0]?.totalSales || 0 });
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  

  

  app.get('/analytics/trending_products', async (req, res) => {
    try {
      const trendingProducts = await Sale.aggregate([
        { $group: { _id: '$ProductID', totalQuantity: { $sum: '$Quantity' }, totalSales: { $sum: '$TotalAmount' } } },
        { $sort: { totalQuantity: -1 } },
        { $limit: 3 },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'ProductID',
            as: 'productDetails',
          },
        },
        { $unwind: '$productDetails' },
        {
          $project: {
            ProductName: '$productDetails.ProductName',
            totalQuantity: 1,
            totalSales: 1,
          },
        },
      ]);
      res.json(trendingProducts);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  

  app.get('/analytics/category_sales', async (req, res) => {
    try {
      const categorySales = await Sale.aggregate([
        {
          $lookup: {
            from: 'products',
            localField: 'ProductID',
            foreignField: 'ProductID',
            as: 'productDetails',
          },
        },
        { $unwind: '$productDetails' },
        {
          $group: {
            _id: '$productDetails.Category',
            totalSales: { $sum: '$TotalAmount' },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            category: '$_id',
            totalSales: 1,
            count: 1,
          },
        },
      ]);
  
      const totalSales = categorySales.reduce((acc, curr) => acc + curr.totalSales, 0);
  
      const result = categorySales.map((category) => ({
        category: category.category,
        totalSales: category.totalSales,
        count: category.count,
        percentage: ((category.totalSales / totalSales) * 100).toFixed(2),
      }));
  
      res.json(result);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });

  


  app.get('/products', async (req, res) => {
    try {
      const productSales = await Sale.aggregate([
        {
          $group: {
            _id: '$ProductID',
            totalQuantity: { $sum: '$Quantity' },
            totalSales: { $sum: '$TotalAmount' },
          },
        },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: 'ProductID',
            as: 'productDetails',
          },
        },
        { $unwind: '$productDetails' },
        {
          $project: {
            ProductName: '$productDetails.ProductName',
            Category: '$productDetails.Category',
            Price: '$productDetails.Price',
            totalQuantity: 1,
            totalSales: 1,
          },
        },
      ]);
      res.json(productSales);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  


  const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});