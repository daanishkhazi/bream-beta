// components/Layout.tsx

import React, { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }: LayoutProps) => (
  <div>
    <Header />
    {children}
    <Footer />
  </div>
);

export default Layout;
