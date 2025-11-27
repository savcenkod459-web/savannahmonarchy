import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Catalog from "./pages/Catalog";
import Breeders from "./pages/Breeders";
import Guide from "./pages/Guide";
import Payment from "./pages/Payment";
import Warranty from "./pages/Warranty";
import Contact from "./pages/Contact";
import AdminCats from "./pages/AdminCats";
import AdminPedigree from "./pages/AdminPedigree";
import AdminImages from "./pages/AdminImages";
import AdminMessages from "./pages/AdminMessages";
import AdminTranslations from "./pages/AdminTranslations";
import Pedigree from "./pages/Pedigree";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import UpdatePassword from "./pages/UpdatePassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: true,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/breeders" element={<Breeders />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/warranty" element={<Warranty />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/update-password" element={<UpdatePassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/pedigree/:catId" element={<Pedigree />} />
          <Route path="/admin/cats" element={<AdminCats />} />
          <Route path="/admin/pedigree" element={<AdminPedigree />} />
          <Route path="/admin/images" element={<AdminImages />} />
          <Route path="/admin/messages" element={<AdminMessages />} />
          <Route path="/admin/translations" element={<AdminTranslations />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
