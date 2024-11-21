<template>
  <div class="container">
    <h1>Tableau de bord</h1>

    <!-- Menu déroulant pour la sélection de période -->
    <label for="time-period">Sélectionnez une période :</label>
    <select v-model="selectedPeriod" @change="fetchData">
      <option value="7days">7 derniers jours</option>
      <option value="30days">30 derniers jours</option>
      <option value="12months">12 derniers mois</option>
    </select>

    <!-- Statistiques principales -->
    <div class="statistics">
      <p>Ventes totales : {{ totalSales }}</p>
      <p>Produits les plus vendus :</p>
      <ul>
        <li v-for="(product, index) in topProducts" :key="index">
          {{ product.ProductName }} - {{ product.totalQuantity }} unités vendues
        </li>
      </ul>
    </div>

    <!-- Tableau des produits -->
    <h2>Produits</h2>
    <div class="table-container">
    <table>
      <thead>
        <tr>
          <th>Nom</th>
          <th>Category</th>
          <th>Prix</th>
          <th>Nombre de ventes</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="product in products" :key="product.ProductID">
          <td>{{ product.ProductName }}</td>
          <td>{{ product.Category }}</td>
          <td>{{ product.Price }}</td>
          <td>{{ product.totalQuantity }}</td>
        </tr>
      </tbody>
    </table>
    </div>

    <!-- Graphiques -->
    <h2>Visualisations</h2>
    <div v-if="isVisualizationLoading" class="visualization-loading">
  <!-- Design de chargement -->
  <p>Chargement des visualisations...</p>
  <div class="skeleton-chart"></div>
</div>

<div v-else>
  <!-- Graphiques -->
  <canvas id="salesByCategoryChart"></canvas>
  <canvas id="salesByProductChart"></canvas>
</div>
  </div>
</template>

<script>
import Chart from "chart.js";

export default {
  name: "Dashboard",
  data() {
    return {
      selectedPeriod: "30days", // Période par défaut
      totalSales: 0,
      topProducts: [],
      products: [],
      salesByCategory: [], // Données pour les graphiques 
    };
  },
  methods: {
    // Fonction pour récupérer les données depuis votre API Node.js
    async fetchData() {
      try {
        // Ventes totales
        const salesResponse = await fetch(
          `http://localhost:3000/analytics/total_sales?period=${this.selectedPeriod}`
        );
        const salesData = await salesResponse.json();
        this.totalSales = salesData.totalSales;

        // Produits les plus vendus
        const topProductsResponse = await fetch(
          `http://localhost:3000/analytics/trending_products?period=${this.selectedPeriod}`
        );
        const topProductsData = await topProductsResponse.json();
        this.topProducts = topProductsData;

        // Données pour le tableau
        const productsResponse = await fetch("http://localhost:3000/products");
        const productsData = await productsResponse.json();
        this.products = productsData;

        // Répartition des ventes par catégorie
        const categorySalesResponse = await fetch(
          `http://localhost:3000/analytics/category_sales?period=${this.selectedPeriod}`
        );
        const categorySalesData = await categorySalesResponse.json();
        this.salesByCategory = categorySalesData;

        // Mettre à jour les graphiques
        this.renderCharts();
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    },
    renderCharts() {
      // Répartition des ventes par catégorie (graphique en secteurs)
      const categories = this.salesByCategory.map((item) => item.category);
      const categorySales = this.salesByCategory.map((item) => item.totalSales);
      new Chart(document.getElementById("salesByCategoryChart"), {
        type: "pie",
        data: {
          labels: categories,
          datasets: [
            {
              data: categorySales,
              backgroundColor: ["#42b983", "#ffcc00", "#ff6f61"],
            },
          ],
        },
      });

      // Ventes par produit (histogramme)
      const productNames = this.products.map((product) => product.ProductName);
      const productSales = this.products.map((product) => product.totalQuantity);
      new Chart(document.getElementById("salesByProductChart"), {
        type: "bar",
        data: {
          labels: productNames,
          datasets: [
            {
              label: "Ventes par produit",
              data: productSales,
              backgroundColor: "#42b983",
            },
          ],
        },
      });
    },
  },
  mounted() {
    // Charger les données dès que le composant est monté
    this.fetchData();
  },
};
</script>

<style scoped>
.statistics {
  margin-bottom: 20px;
}
.table-container {
  max-height: 400px; /* Ajustez la hauteur maximale selon vos besoins */
  overflow-y: auto; /* Barre de défilement verticale */
  border: 1px solid #ddd; /* Optionnel : bordure pour démarquer le tableau */
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background-color: #f4f4f4;
}
canvas {
  margin: 20px 0;
}
</style>
