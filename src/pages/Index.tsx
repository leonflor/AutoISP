import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Benefits } from '@/components/landing/Benefits';
import { Ecosystem } from '@/components/landing/Ecosystem';
import { Stats } from '@/components/landing/Stats';
import { Features } from '@/components/landing/Features';
import { Plans } from '@/components/landing/Plans';
import { Testimonials } from '@/components/landing/Testimonials';
import { FAQ } from '@/components/landing/FAQ';
import { ContactForm } from '@/components/landing/ContactForm';
import { Footer } from '@/components/landing/Footer';
import { ChatWidget } from '@/components/landing/ChatWidget';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Benefits />
        <Stats />
        <Features />
        <Plans />
        <Testimonials />
        <FAQ />
        <ContactForm />
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Index;
