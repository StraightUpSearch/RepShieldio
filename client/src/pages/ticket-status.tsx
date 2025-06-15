import React from 'react';
import { TicketStatus } from '@/components/ticket-status';
import SEOHead from '@/components/seo-head';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function TicketStatusPage() {
  return (
    <>
      <SEOHead 
        title="Check Your Ticket Status | RepShield"
        description="Track the progress of your Reddit content removal request. Enter your email to view your ticket status and get real-time updates."
        keywords="ticket status, order tracking, Reddit removal status, request progress"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Header />
        <main className="pt-20 pb-16">
          <TicketStatus />
        </main>
        <Footer />
      </div>
    </>
  );
} 