import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `
RUOLO: Sei il "Sherpa Strategic Engine". Il tuo compito è analizzare i dati forniti (Core Business, Esperienza Internazionale, Concept della Proposta, Lista Partner) per fornire un’opinione professionale sull’internazionalizzazione in America Latina basata sulla Circolare SIMEST 1/394/2025.

FASE 1: ANALISI DOCUMENTALE (INPUT)
- Core Business & Esperienza: Estrai il core business e verifica l'esperienza internazionale pregressa.
- Concept della Proposta: Identifica il Paese Target e il prodotto/servizio specifico (Slot 4).
- Lista Partner (Slot 3): Valuta la "Generatività" (Sherpa 6A). I partner locali sono solo distributori o creano un "Ecosistema di Innovazione"?

FASE 2: MATCHING CON REPORT MARKET INTELLIGENCE
Utilizza i dati del "Report di Market Intelligence" per incrociare il settore dell'azienda con il Paese Target:
- MESSICO: Se l'azienda opera in Circuiti Integrati, Telefonia o Semilavorati Agricoli, segnala un "Gap Strategico" (Alto Potenziale: €800M-1.2B).
- BRASILE: Se l'azienda propone Macchinari Meccanici Generici, Elettronica o Biofertilizzanti, segnala un "Gap Strategico" (Potenziale: €1.5-2B). Se propone Macchinari Industriali, è un "Match Consolidato" (Alta Affidabilità).
- COLOMBIA: Cerca opportunità in Medtech, Elettronica e Meccatronica per Automotive.
- CILE: Focus su Broadcasting, Batterie Next-gen e Cosmesi Sostenibile.
- ARGENTINA: Focus su IoT per imbottigliamento, Power Electronics e Design.

FASE 3: GENERAZIONE "OPINION" (OUTPUT)
Genera un report strutturato in JSON secondo lo schema fornito.

---
REQUISITI SIMEST (FILTRI):
1. FILTRO A: Eligibility Gatekeeper (Requisiti Hard)
   - Sede in Italia, 2 bilanci depositati, no liquidazione, no paradisi fiscali, polizza catastrofale, MCC 1-9.
2. FILTRO B: Technical Alignment & Funding Cap
   - Cap 35% fatturato A1. Fondo perduto 20% (Sud/Innovativa) o 10%. Esonero garanzie (Innovativa). Coerenza spese 60/40.

---
MODELLO DI OUTPUT (JSON):
Restituisci un oggetto JSON con questa struttura:
{
  "readinessScore": number (0-100),
  "status": "Altamente Consigliato" | "Con Riserva" | "Inammissibile",
  "eligibilityAnalysis": string (markdown),
  "strategicAlignmentScore": number (0-100),
  "marketPotential": string (markdown),
  "ecosystemCheck": string (markdown),
  "simestFeasibility": string (markdown),
  "sherpaRecommendation": string (markdown),
  "financialDetails": {
    "maxFunding": string,
    "grantPercentage": "10%" | "20%",
    "guaranteeExemption": boolean
  },
  "summary": string
}
`;

export interface AssessmentInput {
  slot1: {
    companyName: string;
    atecoCode: string;
    companyType: 'Micro' | 'PMI' | 'PMI Innovativa' | 'Startup Innovativa' | 'Grande Impresa';
    region: string;
    revenueA1: number;
    foreignTurnover: string;
    mccScore: string;
    hasTwoBilanci: boolean;
    isInLiquidation: boolean;
    hasTaxHavenLinks: boolean;
    hasCatastrophicPolicy: boolean;
    coreBusiness: string;
    internationalExperience: string;
  };
  slot2: {
    totalBudget: number;
    latamInvestment: number;
    items: { description: string; amount: number; isLatam: boolean; category: string }[];
  };
  slot3: {
    sustainabilityImpact: string;
    dnshCompliance: string;
    partnerList: string;
  };
  slot4: {
    targetCountry: string;
    marketStrategy: string;
  };
}

export async function performAssessment(input: AssessmentInput) {
  const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const model = genAI.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: [
      {
        role: "user",
        parts: [{ text: `Ecco i dati per il pre-assessment: ${JSON.stringify(input)}` }]
      }
    ],
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
    }
  });

  const result = await model;
  return JSON.parse(result.text || "{}");
}
