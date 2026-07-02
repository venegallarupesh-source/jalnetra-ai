import { useState, useEffect } from 'react';
import { I18nProvider } from './i18n/I18nContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Chatbot from './components/Chatbot';
import CropMap from './components/CropMap';
import Predictor from './components/Predictor';
import WhatsAppAdvisory from './components/WhatsAppAdvisory';
import DashboardPreview from './components/DashboardPreview';
import AuthPage from './components/AuthPage';
import Profile from './components/Profile';
import NotFound from './components/NotFound';
import {
  ProblemSection, WhyShortSection, SolutionSection, InnovationSection,
  ArchitectureSection, PipelineSection, TechStackSection, ResultsSection,
  ScalabilitySection, CompetitiveSection, PlanSection, BusinessSection,
  TestimonialsSection, FAQSection, TeamSection, Footer,
} from './components/Sections';

type Page = 'home' | 'signin' | 'signup' | 'profile' | '404';

function AppContent() {
  const [page, setPage] = useState<Page>('home');
  const [currentSection, setCurrentSection] = useState('home');

  const handleNavigate = (target: string) => {
    // Auth pages
    if (target === 'signin' || target === 'signup' || target === 'profile') {
      setPage(target as Page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    // 404
    if (target === '404') {
      setPage('404');
      return;
    }
    // Landing page sections
    setPage('home');
    setCurrentSection(target);
    // Scroll to section
    setTimeout(() => {
      const el = document.getElementById(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  // Track scroll position to update currentSection for navbar highlight
  useEffect(() => {
    if (page !== 'home') return;
    const handler = () => {
      const sections = ['problem', 'solution', 'map', 'predictor', 'team'];
      for (const s of sections) {
        const el = document.getElementById(s);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
            setCurrentSection(s);
            return;
          }
        }
      }
      setCurrentSection('home');
    };
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, [page]);

  

  if (page === 'profile') {
    return (
      <>
        <Navbar onNavigate={handleNavigate} currentPage={page} />
        <Profile onNavigate={handleNavigate} />
        <Footer onNavigate={handleNavigate} />
        <Chatbot />
      </>
    );
  }

  if (page === '404') {
    return <NotFound onNavigate={handleNavigate} />;
  }

  return (
    <>
      <Navbar onNavigate={handleNavigate} currentPage={currentSection} />
      <main id="main">
        <Hero onNavigate={handleNavigate} />
        <ProblemSection />
        <WhyShortSection />
        <SolutionSection />
        <InnovationSection />
        <ArchitectureSection />
        <PipelineSection />
        <CropMap onNavigate={handleNavigate} />
        <Predictor onNavigate={handleNavigate} />
        <WhatsAppAdvisory />
        <TechStackSection />
        <DashboardPreview />
        <ResultsSection />
        <ScalabilitySection />
        <CompetitiveSection />
        <PlanSection />
        <BusinessSection />
        <TestimonialsSection />
        <FAQSection />
        <TeamSection />
      </main>
      <Footer onNavigate={handleNavigate} />
      <Chatbot />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <I18nProvider>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
