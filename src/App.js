import React, { useState } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import UserList from './pages/users/UserList';
import UserCreate from './pages/users/UserCreate';
import UserDetails from './pages/users/UserDetails';
import UserEdit from './pages/users/UserEdit';
import FournisseurList from './pages/fournisseurs/FournisseurList';
import Profile from './pages/Profile';
import FournisseurCreate from './pages/fournisseurs/FournisseurCreate';
import FournisseurDetails from './pages/fournisseurs/FournisseurDetails';
import FournisseurEdit from './pages/fournisseurs/FournisseurEdit';
import CategorieList from './pages/categories/CategorieList';
import CategorieCreate from './pages/categories/CategorieCreate';
import CategorieDetails from './pages/categories/CategorieDetails';
import CategorieEdit from './pages/categories/CategorieEdit';
import ProduitList from './pages/produits/ProduitList';
import ProduitCreate from './pages/produits/ProduitCreate';
import ProduitDetails from './pages/produits/ProduitDetails';
import ProduitEdit from './pages/produits/ProduitEdit';
import StockManager from './pages/stocks/StockManager';
import CommandeList from './pages/commandes/CommandeList';
import CommandeCreate from './pages/commandes/CommandeCreate';
import CommandeDetails from './pages/commandes/CommandeDetails';
import CommandeEdit from './pages/commandes/CommandeEdit';
import VenteListe from './pages/ventes/VenteListe';
import VenteCreate from './pages/ventes/VenteCreate';
import VenteDetails from './pages/ventes/VenteDetails';
import ClientListe from './pages/clients/ClientListe';
import ClientDetails from './pages/clients/ClientDetails';
import ClientCreate from './pages/clients/ClientCreate';
import ClientEdit from './pages/clients/ClientEdit';
import DemandesValidation from './pages/stocks/DemandesValidation';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshData = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Router>
      <Routes>
        {/* Pages publiques */}
        <Route path="/login" element={<Login />} />

        {/* Routes protégées avec PrivateRoute qui contient Layout */}
        <Route element={
          <PrivateRoute 
            refreshData={refreshData} 
            setRefreshKey={setRefreshKey} 
          />
        }>
          <Route path="/dashboard" element={<Dashboard refreshKey={refreshKey} />} />
          <Route path="/users" element={<UserList />} />
          <Route path="/users/create" element={<UserCreate />} />
          <Route path="/users/:id" element={<UserDetails />} />
          <Route path="/users/:id/edit" element={<UserEdit />} />
          <Route path="/profile" element={<Profile />} />

          {/* Routes fournisseurs */}
          <Route path="/fournisseurs" element={<FournisseurList />} />
          <Route path="/fournisseurs/create" element={<FournisseurCreate />} />
          <Route path="/fournisseurs/:id" element={<FournisseurDetails />} />
          <Route path="/fournisseurs/:id/edit" element={<FournisseurEdit />} />

          {/* Routes categories */}
          <Route path="/categories" element={<CategorieList />} />
          <Route path="/categories/create" element={<CategorieCreate />} />
          <Route path="/categories/:id" element={<CategorieDetails />} />
          <Route path="/categories/edit/:id" element={<CategorieEdit />} />

          {/* Routes produits */}
          <Route path="/produits" element={<ProduitList />} />
          <Route path="/produits/create" element={<ProduitCreate />} />
          <Route path="/produits/:id" element={<ProduitDetails />} />
          <Route path="/produits/edit/:id" element={<ProduitEdit />} />

          {/* Routes stocks */}
          <Route path="/stocks" element={<Navigate to="/stocks/niveaux" replace />} />
          <Route path="/stocks/:section" element={<StockManager />} />

          {/* Routes commandes */}
          <Route path="/commandes" element={<CommandeList />} />
          <Route path="/commandes/create" element={<CommandeCreate />} />
          <Route path="/commandes/:id" element={<CommandeDetails />} />
          <Route path="/commandes/edit/:id" element={<CommandeEdit />} />

          {/* Routes ventes */}
          <Route path="/ventes" element={<VenteListe />} />
          <Route path="/ventes/create" element={<VenteCreate />} />
          <Route path="/ventes/:id" element={<VenteDetails />} />

          {/* Routes clients */}
          <Route path="/clients" element={<ClientListe />} />
          <Route path="/clients/create" element={<ClientCreate />} />
          <Route path="/clients/:id" element={<ClientDetails />} />
          <Route path="/clients/edit/:id" element={<ClientEdit />} />

          {/* Demandes validation */}
          <Route path="/demandes-validation" element={<DemandesValidation />} />
        </Route>

        {/* Redirections */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;