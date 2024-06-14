import Navbar from "../Navbar";
import { FC, ReactNode } from "react";
import { Toaster } from "../ui/toaster";
import Footer from "../Footer";
import PlanBanner from "../PlanBanner";

const RootLayout: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <PlanBanner />
      <main>{children}</main>
      <span className="mt-10"></span>
      <Footer />
      <Toaster />
    </div>
  );
};

export default RootLayout;
