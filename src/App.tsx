import { Outlet, ScrollRestoration } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function App() {
  return (
    <div data-testid="app" className="flex flex-col justify-between min-h-screen text-fg">
      <Header />
      <ScrollRestoration />
      <Outlet />
      <Footer />
    </div>
  );
}
