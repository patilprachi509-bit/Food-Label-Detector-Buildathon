export interface JargonEntry {
  id: string;
  pattern: RegExp;
  termEn: string;
  termHi: string;
  explanationEn: string;
  explanationHi: string;
}

export const JARGON_DICTIONARY: JargonEntry[] = [
  {
    id: "gi",
    pattern: /\b(?:GI|Glycemic Index)\b/gi,
    termEn: "GI (Glycemic Index)",
    termHi: "GI (ग्लाइसेमिक इंडेक्स)",
    explanationEn: "How fast a food raises your blood sugar after eating — higher means a quicker spike.",
    explanationHi: "खाना खाने के बाद कितनी जल्दी यह आपके ब्लड शुगर को बढ़ाता है — जितना अधिक, उतना तेज़ स्पाइक।"
  },
  {
    id: "rda",
    pattern: /\bRDA\b/gi,
    termEn: "RDA",
    termHi: "RDA",
    explanationEn: "The recommended amount of a nutrient for an average adult each day.",
    explanationHi: "एक औसत वयस्क के लिए हर दिन किसी पोषक तत्व की बताई गई मात्रा।"
  },
  {
    id: "fssai",
    pattern: /\bFSSAI\b/gi,
    termEn: "FSSAI",
    termHi: "FSSAI",
    explanationEn: "India's food safety regulator, the government body that sets these rules.",
    explanationHi: "भारत का खाद्य सुरक्षा नियामक, वह सरकारी संस्था जो ये नियम बनाती है।"
  },
  {
    id: "icmr",
    pattern: /\bICMR(?:-NIN)?\b/gi,
    termEn: "ICMR-NIN",
    termHi: "ICMR-NIN",
    explanationEn: "India's own nutrition research body.",
    explanationHi: "भारत की अपनी पोषण अनुसंधान संस्था।"
  },
  {
    id: "adult_ref",
    pattern: /\b(?:Adult reference|वयस्क संदर्भ)\b/gi,
    termEn: "Adult reference",
    termHi: "वयस्क संदर्भ",
    explanationEn: "A standard reference figure, not personalized to the individual user.",
    explanationHi: "एक मानक संदर्भ आंकड़ा, जो व्यक्तिगत उपयोगकर्ता के लिए नहीं है।"
  },
  {
    id: "emulsifier",
    pattern: /\b(?:Emulsifiers?|एमल्सीफायर)\b/gi,
    termEn: "Emulsifier",
    termHi: "एमल्सीफायर",
    explanationEn: "Used to mix ingredients together that would normally separate, like oil and water.",
    explanationHi: "उन सामग्रियों को मिलाने के लिए इस्तेमाल होता है जो आमतौर पर अलग हो जाती हैं, जैसे तेल और पानी।"
  },
  {
    id: "preservative",
    pattern: /\b(?:Preservatives?|प्रिज़र्वेटिव)\b/gi,
    termEn: "Preservative",
    termHi: "प्रिज़र्वेटिव",
    explanationEn: "Added to make food last longer and prevent it from spoiling quickly.",
    explanationHi: "भोजन को लंबे समय तक खराब होने से बचाने के लिए मिलाया जाता है।"
  },
  {
    id: "antioxidant",
    pattern: /\b(?:Antioxidants?|एंटीऑक्सीडेंट)\b/gi,
    termEn: "Antioxidant",
    termHi: "एंटीऑक्सीडेंट",
    explanationEn: "Helps prevent food from going stale, changing colour, or going bad due to oxygen.",
    explanationHi: "भोजन को बासी होने, रंग बदलने या ऑक्सीजन के कारण खराब होने से बचाने में मदद करता है।"
  }
];
