import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ContentProvider } from "@/content/ContentProvider";
import { SiteLayout } from "@/components/site/SiteLayout";
import Index from "./pages/Index";
import Sobre from "./pages/Sobre";
import Agenda from "./pages/Agenda";
import Mensagens from "./pages/Mensagens";
import Contato from "./pages/Contato";
import Admins from "./pages/Admins";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ContentProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <SiteLayout>
                  <Index />
                </SiteLayout>
              }
            />
            <Route
              path="/sobre"
              element={
                <SiteLayout>
                  <Sobre />
                </SiteLayout>
              }
            />
            <Route
              path="/agenda"
              element={
                <SiteLayout>
                  <Agenda />
                </SiteLayout>
              }
            />
            <Route
              path="/mensagens"
              element={
                <SiteLayout>
                  <Mensagens />
                </SiteLayout>
              }
            />
            <Route
              path="/contato"
              element={
                <SiteLayout>
                  <Contato />
                </SiteLayout>
              }
            />
            <Route path="/admins" element={<Admins />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ContentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
