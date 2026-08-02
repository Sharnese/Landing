import React from 'react';
import { Phone, Mail, Calendar, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

// The actual forms now live in modals (RequestCallModal, EmailUsModal, DemoModal).
// This section only shows CTA buttons that open those modals — no forms are
// rendered openly on the landing page.
const Contact: React.FC<{ onDemo: () => void; onCall: () => void; onEmail: () => void }> = ({ onDemo, onCall, onEmail }) => {
  const cards = [
    {
      icon: Phone, title: 'Request a Call',
      desc: 'Leave your contact info and a specialist will call you back at your preferred time.',
      cta: 'Request a Call', onClick: onCall,
    },
    {
      icon: Mail, title: 'Email Us',
      desc: 'Send us a message about the platform, pricing, implementation, or onboarding.',
      cta: 'Email Us', onClick: onEmail,
    },
    {
      icon: Calendar, title: 'Book a Demo',
      desc: 'See Myhcbs in action with a product specialist, tailored to your needs.',
      cta: 'Schedule a Demo', onClick: onDemo,
    },
  ];

  return (
    <section id="contact" className="py-24 px-6 bg-white">
      <div id="appointments" className="max-w-[1200px] mx-auto">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide mb-3.5 text-[#116AEF]"><span className="w-2 h-2 rounded-full bg-current" /> Get in Touch</div>
          <h2 className="font-extrabold text-[#0F172A] tracking-tight mb-4" style={{ fontSize: 'clamp(28px,4vw,42px)' }}>We'd Love to Hear From You</h2>
          <p className="text-base text-slate-500 max-w-[560px] mx-auto">Request a call, send us an email, or book a demo — our team typically responds within one business day.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((c) => (
            <div key={c.title} className="bg-[#F4F5FB] border border-slate-100 rounded-3xl p-8 flex flex-col">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>
                <c.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">{c.title}</h3>
              <p className="text-sm text-slate-500 mb-6 flex-1">{c.desc}</p>
              <button onClick={c.onClick} className="w-full text-white text-sm font-semibold py-3 rounded-xl shadow-[0_3px_12px_rgba(17,106,239,0.3)] hover:-translate-y-px transition flex items-center justify-center gap-1.5" style={{ background: 'linear-gradient(135deg,#005DFF,#76BCFF)' }}>
                {c.cta} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-[#F4F5FB] border border-slate-100 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div>
            <h3 className="text-lg font-bold text-[#0F172A] mb-1">Register for a Session</h3>
            <p className="text-sm text-slate-500">Reserve a spot in upcoming office hours or training sessions.</p>
          </div>
          <div className="flex gap-2.5 w-full sm:w-auto">
            <Link to="/book/office-hours" className="flex-1 sm:flex-none py-2.5 px-5 bg-white border-[1.5px] border-slate-200 rounded-xl text-[13px] font-semibold text-[#444749] hover:border-[#116AEF] hover:text-[#116AEF] flex items-center justify-center gap-1.5 transition"><Clock className="w-3.5 h-3.5" /> Office Hours</Link>
            <Link to="/book/training" className="flex-1 sm:flex-none py-2.5 px-5 bg-white border-[1.5px] border-slate-200 rounded-xl text-[13px] font-semibold text-[#444749] hover:border-[#116AEF] hover:text-[#116AEF] flex items-center justify-center gap-1.5 transition"><Calendar className="w-3.5 h-3.5" /> Training</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
