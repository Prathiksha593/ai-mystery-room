import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import CreateCase from './pages/CreateCase';
import InvestigationRoom from './pages/InvestigationRoom';
import Accusation from './pages/Accusation';
import Results from './pages/Results';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold tracking-wider text-rose-500 hover:text-rose-400">
          SHADOWS & LOGIC <span className="text-xs text-slate-400 font-normal">| AI Mystery Desk</span>
        </Link>
        <span className="text-xs uppercase tracking-widest bg-rose-950 text-rose-300 border border-rose-800/50 px-3 py-1 rounded">
          ACP VERMA CASE FILE #884
        </span>
      </header>
      <main className="flex-grow container mx-auto px-4 py-6 max-w-6xl">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateCase />} />
          <Route path="/investigate/:id" element={<InvestigationRoom />} />
          <Route path="/accuse/:id" element={<Accusation />} />
          <Route path="/results/:id" element={<Results />} />
        </Routes>
      </main>
      <footer className="border-t border-slate-800 px-6 py-4 text-center text-xs text-slate-500">
        AI Mystery Room — Detective Case Protocol &copy; 2026
      </footer>
    </div>
  );
}