import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AdminAuthProvider } from "@/contexts/AdminAuth";
import { PageVisibilityProvider, GatedPage } from "@/contexts/PageVisibility";

import Landing from "./pages/Landing";
import BookingPage from "./pages/BookingPage";
import NotFound from "./pages/NotFound";
import SignIn from "./pages/SignIn";
import UseCases from "./pages/UseCases";
import UseCaseDetail from "./pages/UseCaseDetail";
import LearningCenter from "./pages/LearningCenter";
import Pricing from "./pages/Pricing";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Leads from "./pages/admin/Leads";
import Subscribers from "./pages/admin/Subscribers";
import Appointments from "./pages/admin/Appointments";
import ChatbotAdmin from "./pages/admin/ChatbotAdmin";
import EmailTemplates from "./pages/admin/EmailTemplates";
import Webhooks from "./pages/admin/Webhooks";
import SiteContent from "./pages/admin/SiteContent";
import AdminUsers from "./pages/admin/AdminUsers";
import Settings from "./pages/admin/Settings";
import UseCasesAdmin from "./pages/admin/UseCasesAdmin";
import DemoCalendar from "./pages/admin/DemoCalendar";
import Availability from "./pages/admin/Availability";
import PageVisibility from "./pages/admin/PageVisibility";
import LearningCenterAdmin from "./pages/admin/LearningCenterAdmin";
import PricingAdmin from "./pages/admin/PricingAdmin";

const queryClient = new QueryClient();



const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AdminAuthProvider>
            <PageVisibilityProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/login" element={<SignIn />} />
              <Route path="/use-cases" element={<UseCases />} />
              <Route path="/use-cases/:slug" element={<UseCaseDetail />} />
              <Route path="/learning-center" element={<GatedPage pageKey="learning_center"><LearningCenter /></GatedPage>} />
              <Route path="/learn" element={<GatedPage pageKey="learning_center"><LearningCenter /></GatedPage>} />
              <Route path="/pricing" element={<GatedPage pageKey="pricing"><Pricing /></GatedPage>} />
              <Route path="/book/appointment" element={<BookingPage kind="appointment" />} />
              <Route path="/book/office-hours" element={<BookingPage kind="office-hours" />} />
              <Route path="/book/training" element={<BookingPage kind="training" />} />
              <Route path="/book/event" element={<BookingPage kind="event" />} />

              <Route path="/admin" element={<AdminLogin />} />
              <Route element={<AdminLayout />}>
                <Route path="/admin/dashboard" element={<Dashboard />} />
                <Route path="/admin/leads" element={<Leads />} />
                <Route path="/admin/demos" element={<Leads filterSource="demo" title="Demo Requests" sub="Leads who requested a product demo." />} />
                <Route path="/admin/callbacks" element={<Leads filterSource="callback" title="Callback Requests" sub="Request-a-call submissions." />} />
                <Route path="/admin/subscribers" element={<Subscribers />} />
                <Route path="/admin/appointments" element={<Appointments />} />
                <Route path="/admin/demo-calendar" element={<DemoCalendar />} />
                <Route path="/admin/availability" element={<Availability />} />
                <Route path="/admin/use-cases" element={<UseCasesAdmin />} />
                <Route path="/admin/learning-center" element={<LearningCenterAdmin />} />
                <Route path="/admin/pricing" element={<PricingAdmin />} />
                <Route path="/admin/page-visibility" element={<PageVisibility />} />
                <Route path="/admin/chatbot" element={<ChatbotAdmin />} />
                <Route path="/admin/email-templates" element={<EmailTemplates />} />
                <Route path="/admin/webhooks" element={<Webhooks />} />
                <Route path="/admin/content" element={<SiteContent />} />
                <Route path="/admin/admins" element={<AdminUsers />} />
                <Route path="/admin/specialists" element={<AdminUsers specialistOnly />} />
                <Route path="/admin/settings" element={<Settings />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
            </PageVisibilityProvider>
          </AdminAuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
