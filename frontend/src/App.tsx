<<<<<<< HEAD
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
=======
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
>>>>>>> backup-working-code
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import ChatPage from "./pages/ChatPage";
import Files from "./pages/Files";
import Email from "./pages/Email";
<<<<<<< HEAD
import Settings from "./pages/Settings";
=======
// import Settings from "./pages/Settings";
>>>>>>> backup-working-code
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="chat" element={<ChatPage />} />
            <Route path="files" element={<Files />} />
            <Route path="email" element={<Email />} />
<<<<<<< HEAD
            <Route path="settings" element={<Settings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
=======
            {/* <Route path="settings" element={<Settings />} /> */}
          </Route>
         
>>>>>>> backup-working-code
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
