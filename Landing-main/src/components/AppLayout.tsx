import React, { useState } from 'react';
import SiteNav from '@/components/site/SiteNav';
import Hero from '@/components/site/Hero';
import { ValuePills, Features, Ecosystem, Solutions, Onboarding } from '@/components/site/Sections';
import Contact from '@/components/site/Contact';
import Footer from '@/components/site/Footer';
import Chatbot from '@/components/Chatbot';
import DemoModal from '@/components/DemoModal';
import RequestCallModal from '@/components/site/RequestCallModal';
import EmailUsModal from '@/components/site/EmailUsModal';

const AppLayout: React.FC = () => {
  const [demo, setDemo] = useState(false);
  const [call, setCall] = useState(false);
  const [email, setEmail] = useState(false);
  const openDemo = () => setDemo(true);
  const openCall = () => setCall(true);
  const openEmail = () => setEmail(true);
  return (
    <div className="font-[Inter] bg-white">
      <SiteNav />
      <Hero onDemo={openDemo} />
      <ValuePills />
      <Features />
      <Ecosystem />
      <Solutions />
      <Onboarding />
      <Contact onDemo={openDemo} onCall={openCall} onEmail={openEmail} />
      <Footer onDemo={openDemo} />
      <Chatbot onDemo={openDemo} onCall={openCall} />
      <DemoModal open={demo} onClose={() => setDemo(false)} />
      <RequestCallModal open={call} onClose={() => setCall(false)} />
      <EmailUsModal open={email} onClose={() => setEmail(false)} />
    </div>
  );
};

export default AppLayout;
