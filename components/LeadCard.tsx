import React from 'react';
import type { Lead } from '../types';
import { PinIcon, PhoneIcon, GlobeIcon, ClockIcon, StarIcon, InfoIcon } from './icons';

interface LeadCardProps {
  lead: Lead;
  index: number;
}

const LeadCard: React.FC<LeadCardProps> = ({ lead, index }) => {
  const animationDelay = `${index * 100}ms`;

  return (
    <div 
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/30 flex flex-col space-y-3 transition-all duration-300 hover:border-purple-400/80 hover:shadow-purple-500/40 hover:scale-[1.02]"
      style={{ animation: `fadeInUp 0.5s ${animationDelay} ease-out forwards`, opacity: 0 }}
    >
      <h3 className="text-xl font-bold text-white truncate">{lead.name}</h3>
      
      <div className="space-y-2 text-sm text-white/80">
        <div className="flex items-start gap-2">
          <PinIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-400" />
          <span>{lead.address || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <PhoneIcon className="w-4 h-4 flex-shrink-0 text-purple-400" />
          <span>{lead.phone || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <GlobeIcon className="w-4 h-4 flex-shrink-0 text-purple-400" />
          <a href={lead.website} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">{lead.website || 'N/A'}</a>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4 flex-shrink-0 text-purple-400" />
          <span>{lead.openingHours || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <StarIcon className="w-4 h-4 flex-shrink-0 text-purple-400" />
          <span>{lead.rating ? `${lead.rating} stars` : 'N/A'}</span>
        </div>
        <div className="flex items-start gap-2 pt-1">
          <InfoIcon className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-400" />
          <p className="italic">"{lead.description || 'No description available.'}"</p>
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default LeadCard;