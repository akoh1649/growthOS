import { Switch, Route, Router as WouterRouter, Link, useParams } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Header } from "./components/layout/Header";
import { Hero } from "./components/layout/Hero";
import { AgentsSection } from "./components/agents/AgentGrid";
import { FeaturesSection } from "./components/layout/FeaturesSection";
import { PricingSection } from "./components/layout/PricingSection";
import { CTASection } from "./components/layout/CTASection";
import { Footer } from "./components/layout/Footer";
import DashboardPage from "./app/dashboard/page";
import AgentDetailPage from "./app/agents/[type]/page";
import AnalyticsPage from "./app/analytics/page";
import GeneratePage from "./app/generate/page";

const queryClient = new QueryClient();

function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <AgentsSection />
        <FeaturesSection />
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route path="/generate" component={GeneratePage} />
      <Route path="/agents/:type" component={AgentDetailPage} />
      <Route>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Page Not Found</h1>
            <Link href="/" className="text-emerald-400 hover:underline">Go Home</Link>
          </div>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
