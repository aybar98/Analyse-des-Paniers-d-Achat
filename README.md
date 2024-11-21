Outil simplifié d'analyse des paniers d'achat

## Fonctionnalités
- Affiche les ventes totales sur des périodes spécifiques (7 jours, 30 jours, 12 mois).
- Identifie les produits les plus vendus.
- Répartition des ventes par catégorie.
- Visualisation des données sous forme de tableaux et graphiques.

## Installation et Exécution

### Prérequis
- [Node.js](https://nodejs.org/) installé.
- [MongoDB](https://www.mongodb.com/) installé et en cours d'exécution.
- [Vue.js CLI](https://cli.vuejs.org/) installé globalement.



### Installez les dépendances
npm install


### Démarrez le serveur : cd/src/server
node server.js

- Le serveur est disponible à http://localhost:3000.


### Lancez l'application Vue.js 
npm run serve

- L'application est disponible à http://localhost:8080


### Lancez mongodb 
il doit contenir la base de donnee nommer "mydb" et les collections products et sales


Documentation API
Base URL
L'API est accessible à l'adresse suivante :
http://localhost:3000

1. Ventes totales
GET /analytics/total_sales?period=30days

Description : Retourne le montant total des ventes pour une période donnée.
Paramètres de requête :
period (obligatoire) : Période des ventes à analyser. Options possibles :
7days : Derniers 7 jours.
30days : Derniers 30 jours.
12months : Derniers 12 mois.

2. Produits les plus vendus
GET /analytics/trending_products
Description : Retourne les 3 produits les plus vendus (par quantité) avec leurs informations.

3. Répartition des ventes par catégorie
GET /analytics/category_sales
Description : Retourne les ventes totales et leur pourcentage par catégorie de produit.

4. Liste des produits avec ventes
GET /products
Description : Retourne une liste de tous les produits avec leurs catégories, prix, et ventes totales.




Screen de L'App:
![My Project Logo](./assets/Screenshot.jpeg)




