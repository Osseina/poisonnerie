import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const Layout = ({ children, refreshData, setRefreshKey }) => {
  return (
    <div>
      <Header />
      <Sidebar refreshData={refreshData} setRefreshKey={setRefreshKey} />
      <main id="main" className="main">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;