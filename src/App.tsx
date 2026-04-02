import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Target, 
  Leaf, 
  Globe, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  BarChart3,
  Lightbulb,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { performAssessment, AssessmentInput } from './services/gemini';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';

type Step = 1 | 2 | 3 | 4 | 5;

export default function App() {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const [formData, setFormData] = useState<AssessmentInput>({
    slot1: {
      companyName: '',
      atecoCode: '',
      companyType: 'PMI',
      region: 'Lombardia',
      revenueA1: 0,
      foreignTurnover: '',
      mccScore: '5',
      hasTwoBilanci: true,
      isInLiquidation: false,
      hasTaxHavenLinks: false,
      hasCatastrophicPolicy: false,
      coreBusiness: '',
      internationalExperience: '',
    },
    slot2: {
      totalBudget: 0,
      latamInvestment: 0,
      items: [{ description: '', amount: 0, isLatam: false, category: 'Macchinari e Impianti' }],
    },
    slot3: {
      sustainabilityImpact: '',
      dnshCompliance: '',
      partnerList: '',
    },
    slot4: {
      targetCountry: 'Messico',
      marketStrategy: '',
    },
  });

  const handleInputChange = (slot: keyof AssessmentInput, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [slot]: {
        ...prev[slot],
        [field]: value
      }
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      slot2: {
        ...prev.slot2,
        items: [...prev.slot2.items, { description: '', amount: 0, isLatam: false, category: 'Macchinari e Impianti' }]
      }
    }));
  };

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.slot2.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    const total = newItems.reduce((acc, item) => acc + Number(item.amount), 0);
    const latam = newItems.reduce((acc, item) => acc + (item.isLatam ? Number(item.amount) : 0), 0);

    setFormData(prev => ({
      ...prev,
      slot2: {
        ...prev.slot2,
        items: newItems,
        totalBudget: total,
        latamInvestment: latam
      }
    }));
  };

  const runAssessment = async () => {
    setLoading(true);
    try {
      const res = await performAssessment(formData);
      setResult(res);
      setStep(5);
    } catch (error) {
      console.error(error);
      alert("Errore durante l'analisi. Riprova.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-orange-100 rounded-xl text-orange-600">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">SLOT 1: Identità, Rating e Compliance</h2>
                <p className="text-sm text-gray-500 italic">Dati legali e finanziari obbligatori</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Ragione Sociale</label>
                <input 
                  type="text" 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  placeholder="Nome Azienda Srl"
                  value={formData.slot1.companyName}
                  onChange={(e) => handleInputChange('slot1', 'companyName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Codice ATECO</label>
                <input 
                  type="text" 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  placeholder="es. 28.93"
                  value={formData.slot1.atecoCode}
                  onChange={(e) => handleInputChange('slot1', 'atecoCode', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Tipologia Impresa</label>
                <select 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  value={formData.slot1.companyType}
                  onChange={(e) => handleInputChange('slot1', 'companyType', e.target.value)}
                >
                  <option value="Micro">Micro Impresa</option>
                  <option value="PMI">PMI</option>
                  <option value="PMI Innovativa">PMI Innovativa</option>
                  <option value="Startup Innovativa">Startup Innovativa</option>
                  <option value="Grande Impresa">Grande Impresa</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Sede Operativa (Regione)</label>
                <select 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  value={formData.slot1.region}
                  onChange={(e) => handleInputChange('slot1', 'region', e.target.value)}
                >
                  <optgroup label="Sud e Isole (Fondo Perduto 20%)">
                    <option value="Abruzzo">Abruzzo</option>
                    <option value="Basilicata">Basilicata</option>
                    <option value="Calabria">Calabria</option>
                    <option value="Campania">Campania</option>
                    <option value="Molise">Molise</option>
                    <option value="Puglia">Puglia</option>
                    <option value="Sardegna">Sardegna</option>
                    <option value="Sicilia">Sicilia</option>
                  </optgroup>
                  <optgroup label="Altre Regioni (Fondo Perduto 10%)">
                    <option value="Lombardia">Lombardia</option>
                    <option value="Veneto">Veneto</option>
                    <option value="Emilia-Romagna">Emilia-Romagna</option>
                    <option value="Piemonte">Piemonte</option>
                    <option value="Toscana">Toscana</option>
                    <option value="Lazio">Lazio</option>
                    <option value="Friuli-Venezia Giulia">Friuli-Venezia Giulia</option>
                    <option value="Liguria">Liguria</option>
                    <option value="Marche">Marche</option>
                    <option value="Umbria">Umbria</option>
                    <option value="Trentino-Alto Adige">Trentino-Alto Adige</option>
                    <option value="Valle d'Aosta">Valle d'Aosta</option>
                  </optgroup>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Fatturato Voce A1 (Media 2 anni)</label>
                <input 
                  type="number" 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  placeholder="es. 500000"
                  value={formData.slot1.revenueA1}
                  onChange={(e) => handleInputChange('slot1', 'revenueA1', Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Fatturato Estero (%)</label>
                <input 
                  type="text" 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  placeholder="es. 15%"
                  value={formData.slot1.foreignTurnover}
                  onChange={(e) => handleInputChange('slot1', 'foreignTurnover', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Scoring MCC (1-12)</label>
                <input 
                  type="number" 
                  min="1"
                  max="12"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  value={formData.slot1.mccScore}
                  onChange={(e) => handleInputChange('slot1', 'mccScore', e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input 
                  type="checkbox" 
                  id="bilanci"
                  checked={formData.slot1.hasTwoBilanci}
                  onChange={(e) => handleInputChange('slot1', 'hasTwoBilanci', e.target.checked)}
                  className="w-5 h-5 text-orange-600 rounded"
                />
                <label htmlFor="bilanci" className="text-sm font-bold text-gray-700">Almeno 2 bilanci depositati</label>
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Core Business</label>
                <textarea 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all h-20"
                  placeholder="Descrivi l'attività principale dell'azienda..."
                  value={formData.slot1.coreBusiness}
                  onChange={(e) => handleInputChange('slot1', 'coreBusiness', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Esperienza Internazionale</label>
                <textarea 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 outline-none transition-all h-20"
                  placeholder="Descrivi l'esperienza pregressa sui mercati esteri..."
                  value={formData.slot1.internationalExperience}
                  onChange={(e) => handleInputChange('slot1', 'internationalExperience', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={cn(
                "p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2",
                formData.slot1.isInLiquidation ? "bg-red-50 border-red-200" : "bg-white border-gray-100"
              )} onClick={() => handleInputChange('slot1', 'isInLiquidation', !formData.slot1.isInLiquidation)}>
                <div className="flex items-center justify-between">
                  <AlertTriangle size={18} className={formData.slot1.isInLiquidation ? "text-red-600" : "text-gray-400"} />
                  <div className={cn(
                    "w-10 h-5 rounded-full relative transition-colors",
                    formData.slot1.isInLiquidation ? "bg-red-600" : "bg-gray-200"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                      formData.slot1.isInLiquidation ? "left-6" : "left-1"
                    )} />
                  </div>
                </div>
                <p className="text-xs font-bold uppercase text-gray-700">Liquidazione/Fallimento</p>
              </div>

              <div className={cn(
                "p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2",
                formData.slot1.hasTaxHavenLinks ? "bg-red-50 border-red-200" : "bg-white border-gray-100"
              )} onClick={() => handleInputChange('slot1', 'hasTaxHavenLinks', !formData.slot1.hasTaxHavenLinks)}>
                <div className="flex items-center justify-between">
                  <Globe size={18} className={formData.slot1.hasTaxHavenLinks ? "text-red-600" : "text-gray-400"} />
                  <div className={cn(
                    "w-10 h-5 rounded-full relative transition-colors",
                    formData.slot1.hasTaxHavenLinks ? "bg-red-600" : "bg-gray-200"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                      formData.slot1.hasTaxHavenLinks ? "left-6" : "left-1"
                    )} />
                  </div>
                </div>
                <p className="text-xs font-bold uppercase text-gray-700">Legami Paradisi Fiscali</p>
              </div>

              <div className={cn(
                "p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2",
                formData.slot1.hasCatastrophicPolicy ? "bg-green-50 border-green-200" : "bg-white border-gray-100"
              )} onClick={() => handleInputChange('slot1', 'hasCatastrophicPolicy', !formData.slot1.hasCatastrophicPolicy)}>
                <div className="flex items-center justify-between">
                  <ShieldCheck size={18} className={formData.slot1.hasCatastrophicPolicy ? "text-green-600" : "text-gray-400"} />
                  <div className={cn(
                    "w-10 h-5 rounded-full relative transition-colors",
                    formData.slot1.hasCatastrophicPolicy ? "bg-green-600" : "bg-gray-200"
                  )}>
                    <div className={cn(
                      "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                      formData.slot1.hasCatastrophicPolicy ? "left-6" : "left-1"
                    )} />
                  </div>
                </div>
                <p className="text-xs font-bold uppercase text-gray-700">Polizza Catastrofale</p>
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                <Target size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">SLOT 2: Piano d'Investimento</h2>
                <p className="text-sm text-gray-500 italic">Budget e Voci di Spesa</p>
              </div>
            </div>

            <div className="space-y-4">
              {formData.slot2.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                  <div className="md:col-span-4 space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Descrizione Spesa</label>
                    <input 
                      type="text" 
                      className="w-full border-b border-gray-200 py-1 focus:border-blue-500 outline-none"
                      placeholder="es. Macchinario X"
                      value={item.description}
                      onChange={(e) => updateItem(idx, 'description', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-3 space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Categoria</label>
                    <select 
                      className="w-full border-b border-gray-200 py-1 focus:border-blue-500 outline-none bg-transparent"
                      value={item.category}
                      onChange={(e) => updateItem(idx, 'category', e.target.value)}
                    >
                      <option value="Investimenti in Strutture Fisiche">Investimenti in Strutture Fisiche</option>
                      <option value="Affitto e Allestimento Sedi">Affitto e Allestimento Sedi</option>
                      <option value="Macchinari e Impianti">Macchinari e Impianti</option>
                      <option value="Rafforzamento Società Controllate">Rafforzamento Società Controllate</option>
                      <option value="Formazione Personale Locale">Formazione Personale Locale</option>
                      <option value="Spese di Inserimento Lavorativo">Spese di Inserimento Lavorativo</option>
                      <option value="Consulenza Strategica d'Ingresso">Consulenza Strategica d'Ingresso</option>
                      <option value="Marketing e Promozione Locale">Marketing e Promozione Locale</option>
                      <option value="Sviluppo Partnership e Scouting">Sviluppo Partnership e Scouting</option>
                      <option value="Tecnologie Digitali in Loco">Tecnologie Digitali in Loco</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Importo (€)</label>
                    <input 
                      type="number" 
                      className="w-full border-b border-gray-200 py-1 focus:border-blue-500 outline-none"
                      value={item.amount}
                      onChange={(e) => updateItem(idx, 'amount', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-3 flex items-center gap-2 pb-1">
                    <input 
                      type="checkbox" 
                      id={`latam-${idx}`}
                      checked={item.isLatam}
                      onChange={(e) => updateItem(idx, 'isLatam', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label htmlFor={`latam-${idx}`} className="text-xs font-medium text-gray-600">Investimento in LatAm</label>
                  </div>
                </div>
              ))}
              <button 
                onClick={addItem}
                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-blue-600 hover:border-blue-200 transition-all text-sm font-medium"
              >
                + Aggiungi voce di spesa
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <div>
                <p className="text-xs uppercase font-bold text-blue-400 mb-1">Budget Totale</p>
                <p className="text-2xl font-black text-blue-900">€ {formData.slot2.totalBudget.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs uppercase font-bold text-blue-400 mb-1">Quota LatAm</p>
                <p className={cn(
                  "text-2xl font-black",
                  (formData.slot2.latamInvestment / formData.slot2.totalBudget) >= 0.3 ? "text-green-600" : "text-red-500"
                )}>
                  {formData.slot2.totalBudget > 0 ? ((formData.slot2.latamInvestment / formData.slot2.totalBudget) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-[10px] text-blue-400">Minimo richiesto: 30%</p>
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-green-100 rounded-xl text-green-600">
                <Leaf size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">SLOT 3: Sostenibilità e DNSH</h2>
                <p className="text-sm text-gray-500 italic">Relazione Tecnica Impatto</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Lista Partner & Ecosistema</label>
                <textarea 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all h-32"
                  placeholder="Elenca i partner locali e descrivi se sono distributori o partner tecnologici/strategici (Sherpa 6A)..."
                  value={formData.slot3.partnerList}
                  onChange={(e) => handleInputChange('slot3', 'partnerList', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Impatto Ambientale e Digitale</label>
                <textarea 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all h-32"
                  placeholder="Descrivi come il progetto migliora l'efficienza energetica o la digitalizzazione..."
                  value={formData.slot3.sustainabilityImpact}
                  onChange={(e) => handleInputChange('slot3', 'sustainabilityImpact', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Conformità DNSH</label>
                <textarea 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500 outline-none transition-all h-32"
                  placeholder="Dichiara come il progetto non arreca danno significativo agli obiettivi ambientali..."
                  value={formData.slot3.dnshCompliance}
                  onChange={(e) => handleInputChange('slot3', 'dnshCompliance', e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
                <Globe size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">SLOT 4: Analisi Mercato Target</h2>
                <p className="text-sm text-gray-500 italic">Focus America Latina</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Paese Target</label>
                <select 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                  value={formData.slot4.targetCountry}
                  onChange={(e) => handleInputChange('slot4', 'targetCountry', e.target.value)}
                >
                  <optgroup label="America Latina">
                    <option value="Argentina">Argentina</option>
                    <option value="Bolivia">Bolivia</option>
                    <option value="Brasile">Brasile</option>
                    <option value="Cile">Cile</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Costa Rica">Costa Rica</option>
                    <option value="Cuba">Cuba</option>
                    <option value="Ecuador">Ecuador</option>
                    <option value="El Salvador">El Salvador</option>
                    <option value="Guatemala">Guatemala</option>
                    <option value="Guyana">Guyana</option>
                    <option value="Honduras">Honduras</option>
                    <option value="Messico">Messico</option>
                    <option value="Nicaragua">Nicaragua</option>
                    <option value="Panama">Panama</option>
                    <option value="Paraguay">Paraguay</option>
                    <option value="Perù">Perù</option>
                    <option value="Suriname">Suriname</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Venezuela">Venezuela</option>
                  </optgroup>
                  <optgroup label="Caraibi">
                    <option value="Antigua e Barbuda">Antigua e Barbuda</option>
                    <option value="Bahamas">Bahamas</option>
                    <option value="Barbados">Barbados</option>
                    <option value="Dominica">Dominica</option>
                    <option value="Repubblica Dominicana">Repubblica Dominicana</option>
                    <option value="Grenada">Grenada</option>
                    <option value="Haiti">Haiti</option>
                    <option value="Giamaica">Giamaica</option>
                    <option value="Saint Kitts e Nevis">Saint Kitts e Nevis</option>
                    <option value="Santa Lucia">Santa Lucia</option>
                    <option value="Saint Vincent e Grenadine">Saint Vincent e Grenadine</option>
                    <option value="Trinidad e Tobago">Trinidad e Tobago</option>
                  </optgroup>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Strategia di Ingresso</label>
                <textarea 
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none transition-all h-48"
                  placeholder="Motivazioni della scelta del paese e piano operativo..."
                  value={formData.slot4.marketStrategy}
                  onChange={(e) => handleInputChange('slot4', 'marketStrategy', e.target.value)}
                />
              </div>
            </div>
          </motion.div>
        );
      case 5:
        if (!result) return null;
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8 pb-12"
          >
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-1/3 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl text-center space-y-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">SIMEST-READY SCORE</p>
                <div className="relative inline-flex items-center justify-center">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      className="text-gray-100"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="58"
                      cx="64"
                      cy="64"
                    />
                    <circle
                      className={cn(
                        "transition-all duration-1000",
                        result.readinessScore > 70 ? "text-green-500" : result.readinessScore > 40 ? "text-orange-500" : "text-red-500"
                      )}
                      strokeWidth="8"
                      strokeDasharray={364.4}
                      strokeDashoffset={364.4 - (364.4 * result.readinessScore) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="58"
                      cx="64"
                      cy="64"
                    />
                  </svg>
                  <span className="absolute text-3xl font-black text-gray-900">{result.readinessScore}</span>
                </div>
                <div className={cn(
                  "px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest inline-block",
                  result.status === 'Altamente Consigliato' ? "bg-green-100 text-green-700" : result.status === 'Con Riserva' ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                )}>
                  {result.status}
                </div>
                <p className="text-sm font-medium text-gray-600">{result.summary}</p>
              </div>

              <div className="w-full md:w-2/3 space-y-6">
                <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg">
                  <div className="flex items-center gap-3 mb-6 text-blue-600">
                    <ShieldCheck size={20} />
                    <h3 className="font-black uppercase tracking-widest text-sm">Analisi Eligibilità</h3>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-600">
                    <Markdown>{result.eligibilityAnalysis}</Markdown>
                  </div>
                </section>

                {result.financialDetails && (
                  <section className="bg-blue-900 p-8 rounded-3xl border border-blue-800 shadow-lg text-white">
                    <div className="flex items-center gap-3 mb-6 text-blue-300">
                      <BarChart3 size={20} />
                      <h3 className="font-black uppercase tracking-widest text-sm">Dettagli Finanziari (Stima)</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300/60 mb-1">Cap Massimo Finanziabile</p>
                        <p className="text-xl font-black">{result.financialDetails.maxFunding}</p>
                        <p className="text-[10px] text-blue-300/40 mt-1">35% del fatturato A1</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300/60 mb-1">Quota Fondo Perduto</p>
                        <p className="text-xl font-black">{result.financialDetails.grantPercentage}</p>
                        <p className="text-[10px] text-blue-300/40 mt-1">Basato su sede/status</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300/60 mb-1">Esonero Garanzie</p>
                        <p className="text-xl font-black">{result.financialDetails.guaranteeExemption ? 'SÌ' : 'NO'}</p>
                        <p className="text-[10px] text-blue-300/40 mt-1">Riservato a PMI/Startup Inn.</p>
                      </div>
                    </div>
                  </section>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg border-t-4 border-t-purple-500">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3 text-purple-600">
                      <BarChart3 size={20} />
                      <h3 className="font-black uppercase tracking-widest text-sm">Match Strategico & Potenziale</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Alignment Score</span>
                      <span className="text-lg font-black text-purple-600">{result.strategicAlignmentScore}%</span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Market Potential</h4>
                      <div className="prose prose-sm max-w-none text-gray-600">
                        <Markdown>{result.marketPotential}</Markdown>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-gray-50">
                      <h4 className="text-xs font-bold uppercase text-gray-400 mb-2">Sherpa Ecosystem Check</h4>
                      <div className="prose prose-sm max-w-none text-gray-600">
                        <Markdown>{result.ecosystemCheck}</Markdown>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-lg border-t-4 border-t-blue-500">
                  <div className="flex items-center gap-3 mb-6 text-blue-600">
                    <ShieldCheck size={20} />
                    <h3 className="font-black uppercase tracking-widest text-sm">Fattibilità SIMEST (60/40)</h3>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-600">
                    <Markdown>{result.simestFeasibility}</Markdown>
                  </div>
                </section>
              
                <section className="bg-gray-900 p-8 rounded-3xl shadow-2xl text-white">
                  <div className="flex items-center gap-3 mb-8 text-orange-400">
                    <Lightbulb size={24} />
                    <h3 className="font-black uppercase tracking-widest text-lg">Raccomandazione Sherpa</h3>
                  </div>
                  <div className="prose prose-invert prose-sm max-w-none opacity-90">
                    <Markdown>{result.sherpaRecommendation}</Markdown>
                  </div>
                <div className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-white/40 uppercase tracking-widest">
                    <ShieldCheck size={14} />
                    Sherpa Srl Senior Analyst
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-xs font-bold transition-all"
                  >
                    Esporta PDF
                  </button>
                </div>
              </section>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-sans text-gray-900">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-black italic text-xl">S</div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">SHERPA <span className="text-orange-600">SIMEST</span></h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pre-Assessment Tool v1.0</p>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s}
                className={cn(
                  "flex items-center gap-2 transition-all",
                  step === s ? "opacity-100" : "opacity-30"
                )}
              >
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black",
                  step === s ? "bg-gray-900 text-white" : "bg-gray-200 text-gray-600"
                )}>
                  {s}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {s === 1 ? 'Identità' : s === 2 ? 'Budget' : s === 3 ? 'DNSH' : 'Mercato'}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Analista Senior</p>
              <p className="text-xs font-bold">Sherpa Srl</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden">
              <img src="https://picsum.photos/seed/analyst/100/100" alt="Avatar" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {renderStep()}

          {step < 5 && (
            <div className="mt-12 flex items-center justify-between pt-8 border-t border-gray-100">
              <button 
                disabled={step === 1 || loading}
                onClick={() => setStep(prev => (prev - 1) as Step)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-gray-500 hover:bg-gray-100 transition-all disabled:opacity-0"
              >
                <ChevronLeft size={18} />
                Indietro
              </button>
              
              {step < 4 ? (
                <button 
                  onClick={() => setStep(prev => (prev + 1) as Step)}
                  className="flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                >
                  Continua
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button 
                  disabled={loading}
                  onClick={runAssessment}
                  className="flex items-center gap-2 px-8 py-3 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Analisi in corso...
                    </>
                  ) : (
                    <>
                      Genera Report Strategico
                      <BarChart3 size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="mt-12 flex justify-center">
              <button 
                onClick={() => {
                  setResult(null);
                  setStep(1);
                }}
                className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl font-bold text-sm transition-all"
              >
                Nuovo Assessment
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-4 opacity-50">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white font-black italic text-sm">S</div>
            <p className="text-[10px] font-bold uppercase tracking-widest">Sherpa Srl © 2026</p>
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-[10px] font-bold text-gray-400 uppercase hover:text-orange-600 transition-all">Circolare SIMEST 1/394/2025</a>
            <a href="#" className="text-[10px] font-bold text-gray-400 uppercase hover:text-orange-600 transition-all">Metodo 6A</a>
            <a href="#" className="text-[10px] font-bold text-gray-400 uppercase hover:text-orange-600 transition-all">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
