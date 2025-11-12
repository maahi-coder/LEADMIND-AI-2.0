import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Lead } from './types';
import { generateLeads } from './services/geminiService';
import { sendLeadsToWebhook } from './services/webhookService';
import Input from './components/Input';
import Button from './components/Button';
import LeadCard from './components/LeadCard';
import Notification from './components/Notification';
import { SearchIcon, PinIcon, TagIcon, LinkIcon, XIcon, HashIcon } from './components/icons';

type NotificationState = { message: string; type: 'success' | 'error' } | null;

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [place, setPlace] = useState('');
  const [category, setCategory] = useState('');
  const [leadCount, setLeadCount] = useState('10');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [tempWebhookUrl, setTempWebhookUrl] = useState('');
  const [sendToWebhook, setSendToWebhook] = useState(false);
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<NotificationState>(null);
  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number, longitude: number } | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error: GeolocationPositionError) => {
          let userMessage: string;
          switch (error.code) {
            case 1: // PERMISSION_DENIED
              userMessage = 'Location permission denied. Please enable it for more accurate results.';
              console.warn(`Geolocation permission denied: ${error.message}`);
              break;
            case 2: // POSITION_UNAVAILABLE
              userMessage = 'Location information is currently unavailable.';
              console.error(`Error getting location (POSITION_UNAVAILABLE): ${error.message}`);
              break;
            case 3: // TIMEOUT
              userMessage = 'The request to get user location timed out.';
              console.error(`Error getting location (TIMEOUT): ${error.message}`);
              break;
            default:
              userMessage = 'Could not get location. Search may be less accurate.';
              console.error(`An unknown error occurred while getting location: ${error.message}`);
              break;
          }
          setNotification({ message: userMessage, type: 'error' });
        }
      );
    }
  }, []);

  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const handleGenerateLeads = async () => {
    const count = parseInt(leadCount, 10);
    if (!leadCount || isNaN(count) || count <= 0) {
      showNotification('Please enter a valid, positive number for lead count.', 'error');
      return;
    }

    if (!searchQuery || !place) {
      showNotification('Search Query and Place/City are required.', 'error');
      return;
    }
    setIsLoading(true);
    setLeads([]);
    try {
      const generatedLeads = await generateLeads(searchQuery, place, category, count, userLocation);
      setLeads(generatedLeads);

      if (sendToWebhook && webhookUrl) {
        const success = await sendLeadsToWebhook(generatedLeads, webhookUrl);
        if (success) {
          showNotification('✅ Leads Sent Successfully to Webhook.', 'success');
        } else {
          showNotification('❌ Lead Generation Failed — Please check your webhook or internet connection.', 'error');
        }
      } else if (sendToWebhook && !webhookUrl) {
        showNotification('Webhook is enabled, but no URL is set.', 'error');
      }
    } catch (error) {
      console.error(error);
      showNotification('Failed to generate leads. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (leads.length > 0 && resultsRef.current) {
        resultsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [leads]);

  const handleWebhookSave = () => {
    setWebhookUrl(tempWebhookUrl);
    setIsWebhookModalOpen(false);
    showNotification('Webhook URL saved.', 'success');
  };
  
  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(leads, null, 2));
    showNotification('Leads copied to clipboard as JSON.', 'success');
  };

  const WebhookModal = () => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl relative w-full max-w-md mx-4">
        <button onClick={() => setIsWebhookModalOpen(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
          <XIcon />
        </button>
        <h3 className="text-2xl font-bold text-white mb-4">Set Webhook URL</h3>
        <p className="text-white/70 mb-6">Enter your n8n webhook URL to send leads automatically.</p>
        <Input
          icon={<LinkIcon />}
          placeholder="https://your-webhook-url.com/..."
          value={tempWebhookUrl}
          onChange={(e) => setTempWebhookUrl(e.target.value)}
        />
        <div className="flex justify-end mt-6">
          <Button onClick={handleWebhookSave}>Save</Button>
        </div>
      </div>
    </div>
  );

  const LoadingSpinner = () => (
     <div className="flex flex-col items-center justify-center space-y-4 my-8">
        <div className="w-16 h-16 border-4 border-t-purple-500 border-r-purple-500 border-b-purple-500/20 border-l-purple-500/20 rounded-full animate-spin"></div>
        <p className="text-white/80 text-lg animate-pulse">Generating smart leads...</p>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#1a0b2e] to-[#2a0f4a] text-white font-sans p-4 md:p-8">
      {notification && <Notification message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
      {isWebhookModalOpen && <WebhookModal />}
      
      <main className="max-w-4xl mx-auto">
        <header className="text-center my-8 md:my-16">
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 animate-fade-in-down">
            LeadMind AI
          </h1>
          <p className="text-lg md:text-xl text-white/70 mt-2 italic animate-fade-in-up">
            “Think Smart — Find Fast.”
          </p>
        </header>

        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input icon={<SearchIcon />} placeholder="Search Query (e.g., 'restaurants')" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <Input icon={<PinIcon />} placeholder="Place / City" value={place} onChange={(e) => setPlace(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input icon={<TagIcon />} placeholder="Category (Optional)" value={category} onChange={(e) => setCategory(e.target.value)} />
            <Input icon={<HashIcon />} placeholder="Number of leads" value={leadCount} onChange={(e) => setLeadCount(e.target.value)} type="number" />
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
            <button onClick={() => { setTempWebhookUrl(webhookUrl); setIsWebhookModalOpen(true); }} className="text-purple-400 hover:text-purple-300 transition-colors font-semibold">
              Set Webhook
            </button>
            <div className="flex items-center space-x-3">
              <span className="text-white/70">Send to Webhook</span>
              <label htmlFor="webhookToggle" className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="webhookToggle" className="sr-only peer" checked={sendToWebhook} onChange={() => setSendToWebhook(!sendToWebhook)} />
                <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
          
          <div className="!mt-8">
            <button
              onClick={handleGenerateLeads}
              disabled={isLoading}
              className="w-full text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl py-4 px-6 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50 transform transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? 'Generating...' : '⚡ Generate Leads'}
            </button>
          </div>
        </div>

        {isLoading && <LoadingSpinner />}
        
        {leads.length > 0 && (
          <div ref={resultsRef} className="mt-12">
            <h2 className="text-3xl font-bold text-center mb-8">Generated Leads</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leads.map((lead, index) => (
                <LeadCard key={index} lead={lead} index={index} />
              ))}
            </div>
            <div className="flex justify-center mt-8">
                <Button onClick={handleCopyJson}>Copy JSON</Button>
            </div>
          </div>
        )}

        <footer className="text-center mt-16 pb-8">
          <p className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Made with ⚡ by Mahi
          </p>
        </footer>
      </main>
    </div>
  );
}