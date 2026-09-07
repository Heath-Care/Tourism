export interface SupportedLanguage {
  id: string;
  name: string;
  nativeName: string;
  speechCode: string;
  culturalTip: string;
}

export interface LocalizedFallbackItem {
  translatedText: string;
  phonetic: string;
  literalMeaning: string;
  culturalTip: string;
}

export interface LanguageFallbackGroup {
  default: LocalizedFallbackItem;
  greetings?: LocalizedFallbackItem;
  directions?: LocalizedFallbackItem;
  food?: LocalizedFallbackItem;
  emergency?: LocalizedFallbackItem;
}

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = [
  {
    id: 'hindi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    speechCode: 'hi-IN',
    culturalTip: 'Join palms together and say "Namaste" when greeting elders or entering heritage shrines.'
  },
  {
    id: 'bengali',
    name: 'Bengali',
    nativeName: 'বাংলা',
    speechCode: 'bn-IN',
    culturalTip: 'Bengali etiquette values warmth, poetic politeness, and hospitable greetings like "Nomoshkar".'
  },
  {
    id: 'telugu',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    speechCode: 'te-IN',
    culturalTip: 'Say "Namaskaram" with a gentle head nod; address elders with the respectful suffix "-garu".'
  },
  {
    id: 'marathi',
    name: 'Marathi',
    nativeName: 'मराठी',
    speechCode: 'mr-IN',
    culturalTip: 'In Maharashtra, greet with "Namaskar" or "Ram Ram". Addressing with "-ji" or "-tai" shows deep courtesy.'
  },
  {
    id: 'tamil',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    speechCode: 'ta-IN',
    culturalTip: 'Greet with "Vanakkam" with joined hands. Removing footwear before entering sacred or home spaces is essential.'
  },
  {
    id: 'gujarati',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    speechCode: 'gu-IN',
    culturalTip: '"Kem Cho" is warmly appreciated across markets and artisan havelis; hospitality is paramount.'
  },
  {
    id: 'kannada',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    speechCode: 'kn-IN',
    culturalTip: 'Greet with "Namaskara". Polite requests in markets earn instant warmth and artisan respect.'
  },
  {
    id: 'malayalam',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    speechCode: 'ml-IN',
    culturalTip: 'Greet with "Namaskaram". A soft tone of voice and gentle body language are customary in Kerala.'
  },
  {
    id: 'odia',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    speechCode: 'or-IN',
    culturalTip: 'Say "Namaskar" or "Jai Jagannath". Sacred temple precincts require quiet reverence.'
  },
  {
    id: 'punjabi',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    speechCode: 'pa-IN',
    culturalTip: '"Sat Sri Akaal" with folded hands is the traditional greeting. In Gurdwaras, cover your head and wash feet.'
  },
  {
    id: 'assamese',
    name: 'Assamese',
    nativeName: 'অসমীয়া',
    speechCode: 'as-IN',
    culturalTip: 'Greet with "Nomoskar". Offering or receiving the traditional Gamosa scarf is an act of highest honor.'
  },
  {
    id: 'urdu',
    name: 'Urdu',
    nativeName: 'اردو',
    speechCode: 'ur-IN',
    culturalTip: 'Raise right hand gently to the forehead and say "Aadaab" or "Salaam", reflecting classical Tehzeeb courtesy.'
  },
  {
    id: 'kashmiri',
    name: 'Kashmiri',
    nativeName: 'कॉशुर / کٲشُر',
    speechCode: 'hi-IN',
    culturalTip: 'Say "Adaab" or "As-salamu alaykum". Accepting Kahwa tea when offered is a revered sign of guest gratitude.'
  },
  {
    id: 'konkani',
    name: 'Konkani',
    nativeName: 'कोंकणी',
    speechCode: 'mr-IN',
    culturalTip: 'Greet with "Dev Boro Dis Dinv" (God give you a good day) or "Namaskar" across Goan and coastal villages.'
  },
  {
    id: 'manipuri',
    name: 'Manipuri',
    nativeName: 'ꯃꯤꯇꯩꯂꯣꯟ',
    speechCode: 'hi-IN',
    culturalTip: 'Greet with "Khurumjari". Traditional Meitei customs emphasize deep humility and reverence for nature.'
  },
  {
    id: 'sanskrit',
    name: 'Sanskrit',
    nativeName: 'संस्कृतम्',
    speechCode: 'hi-IN',
    culturalTip: 'Say "Namo Namah" or "Suprabhatam" in ancient monastic or Vedic heritage institutions.'
  },
  {
    id: 'english',
    name: 'English',
    nativeName: 'English',
    speechCode: 'en-IN',
    culturalTip: 'Widely understood across all tourist destinations, airports, transit hubs, and boutique hotels in India.'
  }
];

export const FILTER_LANGUAGES: string[] = [
  'All',
  'Hindi',
  'Bengali',
  'Telugu',
  'Marathi',
  'Tamil',
  'Gujarati',
  'Kannada',
  'Malayalam',
  'Odia',
  'Punjabi',
  'Assamese',
  'Urdu',
  'Kashmiri',
  'Konkani',
  'Manipuri',
  'Sanskrit'
];

export function getLanguageByName(nameOrId?: string): SupportedLanguage | undefined {
  if (!nameOrId) return undefined;
  const target = nameOrId.trim().toLowerCase();
  return SUPPORTED_LANGUAGES.find(
    (l) =>
      l.id.toLowerCase() === target ||
      l.name.toLowerCase() === target ||
      l.nativeName.toLowerCase() === target ||
      target.includes(l.name.toLowerCase()) ||
      l.name.toLowerCase().includes(target)
  );
}

export const LOCALIZED_FALLBACKS: Record<string, LanguageFallbackGroup> = {
  hindi: {
    default: {
      translatedText: 'नमस्ते, क्या आप मेरी सहायता कर सकते हैं?',
      phonetic: 'Namaste, kya aap meri sahayata kar sakte hain?',
      literalMeaning: 'Salutations, can you assist me?',
      culturalTip: 'Join both palms at chest level with a slight bow when speaking to locals or artisans.'
    }
  },
  bengali: {
    default: {
      translatedText: 'নমস্কার, আপনি কি আমাকে সাহায্য করতে পারেন?',
      phonetic: 'Nomoshkar, apni ki amake sahajjo korte paren?',
      literalMeaning: 'Greetings, can you help me?',
      culturalTip: 'Speak in a courteous, warm tone; people in Bengal appreciate polite inquiries.'
    }
  },
  telugu: {
    default: {
      translatedText: 'నమస్కారం, మీరు నాకు సహాయం చేయగలరా?',
      phonetic: 'Namaskaram, meeru naaku sahayam cheyagalara?',
      literalMeaning: 'Greetings, can you help me?',
      culturalTip: 'Using "meeru" (polite you) conveys deep respect in conversations.'
    }
  },
  marathi: {
    default: {
      translatedText: 'नमस्कार, आपण मला मदत करू शकता का?',
      phonetic: 'Namaskar, aapan mala madat karu shakta ka?',
      literalMeaning: 'Greetings, can you help me?',
      culturalTip: 'Fold hands gently; starting with "Namaskar" ensures friendly local assistance.'
    }
  },
  tamil: {
    default: {
      translatedText: 'வணக்கம், நீங்கள் எனக்கு உதவ முடியுமா?',
      phonetic: 'Vanakkam, neengal enakku uthava mudiyuma?',
      literalMeaning: 'Salutations, can you assist me?',
      culturalTip: 'Keep hands folded in "Vanakkam" posture; locals appreciate visitors making effort to speak Tamil.'
    }
  },
  gujarati: {
    default: {
      translatedText: 'નમસ્તે, શું તમે મને મદદ કરી શકો છો?',
      phonetic: 'Namaste, shu tame mane madad kari shako chho?',
      literalMeaning: 'Greetings, can you help me?',
      culturalTip: 'Gujarati communities are exceptionally hospitable; polite inquiries are met with generous help.'
    }
  },
  kannada: {
    default: {
      translatedText: 'ನಮಸ್ಕಾರ, ನೀವು ನನಗೆ ಸಹಾಯ ಮಾಡಬಹುದೇ?',
      phonetic: 'Namaskara, neevu nanage sahaya maadabahude?',
      literalMeaning: 'Greetings, can you help me?',
      culturalTip: '"Namaskara" followed by "dayavittu" (please) is very warmly received across Karnataka.'
    }
  },
  malayalam: {
    default: {
      translatedText: 'നമസ്കാരം, എന്നെ ഒന്ന് സഹായിക്കാമോ?',
      phonetic: 'Namaskaram, enne onnu sahayikkamo?',
      literalMeaning: 'Salutations, could you please help me?',
      culturalTip: 'Maintain a soft, calm demeanor; warm smiles are the norm in Kerala backwaters and villages.'
    }
  },
  odia: {
    default: {
      translatedText: 'ନମସ୍କାର, ଆପଣ ମୋତେ ସାହାଯ୍ୟ କରିପାରିବେ କି?',
      phonetic: 'Namaskar, aapana mote saahajya kariparibe ki?',
      literalMeaning: 'Greetings, can you help me?',
      culturalTip: 'Respect sacred temple rules and greet elders with quiet reverence.'
    }
  },
  punjabi: {
    default: {
      translatedText: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਕੀ ਤੁਸੀਂ ਮੇਰੀ ਮਦਦ ਕਰ ਸਕਦੇ ਹੋ?',
      phonetic: 'Sat Sri Akaal, ki tussi meri madad kar sakde ho?',
      literalMeaning: 'Truth is the Timeless One, can you help me?',
      culturalTip: '"Sat Sri Akaal" with hands folded is revered across Punjab and Gurdwara sites.'
    }
  },
  assamese: {
    default: {
      translatedText: 'নমস্কাৰ, আপুনি মোক সহায় কৰিব পাৰিবনে?',
      phonetic: 'Nomoskar, aapuni mok xohay koribo paribone?',
      literalMeaning: 'Greetings, can you assist me?',
      culturalTip: 'Northeastern hospitality is very gentle; greet hosts with a warm smile and slight head bow.'
    }
  },
  urdu: {
    default: {
      translatedText: 'آداب، کیا آپ میری مدد کر سکتے ہیں؟',
      phonetic: 'Aadaab, kya aap meri madad kar sakte hain?',
      literalMeaning: 'Respectful salutations, can you assist me?',
      culturalTip: 'The "Aadaab" gesture with gentle hand raising is deeply respected in historic Lucknow and Old Delhi.'
    }
  },
  kashmiri: {
    default: {
      translatedText: 'سلام، کیا تُہہ ہیکیو میہ مدد کٔرِتھ؟',
      phonetic: 'Salaam, kya tuh hekiyo me madad karith?',
      literalMeaning: 'Peace, can you help me?',
      culturalTip: 'Saying "Salaam" warmly opens conversations across Kashmiri houseboats and artisan alleys.'
    }
  },
  konkani: {
    default: {
      translatedText: 'देव बरें दीस दिंव, तुमी म्हाका मदत करूंक शकता?',
      phonetic: 'Dev borem dis dium, tumi mhaka modot korunk xokta?',
      literalMeaning: 'God give a good day, can you help me?',
      culturalTip: 'A cheerful "Dev borem dis dium" or "Namaskar" builds instant camaraderie in coastal Goa.'
    }
  },
  manipuri: {
    default: {
      translatedText: 'ꯈꯨꯔꯨꯃꯖꯔꯤ, ꯅꯍꯥꯛꯅꯥ ꯑꯩꯉꯣꯟꯗꯥ ꯃꯇꯦꯡ ꯄꯥꯡꯕꯥ ꯌꯥꯒꯗꯔꯥ?',
      phonetic: 'Khurumjari, nahakna eingonda mateng pangba yagadra?',
      literalMeaning: 'Respectful greetings, could you help me?',
      culturalTip: '"Khurumjari" with both hands pressed together honors age-old Meitei traditions.'
    }
  },
  sanskrit: {
    default: {
      translatedText: 'नमो नमः, भवान् मम साहाय्यं कर्तुं शक्नोति किम्?',
      phonetic: 'Namo namah, bhavaan mama saahaayyam kartum shaknoti kim?',
      literalMeaning: 'Salutations upon salutations, are you able to help me?',
      culturalTip: 'Spoken primarily in historic ashrams and classical learning centers.'
    }
  },
  english: {
    default: {
      translatedText: 'Namaste! Could you please help me with directions?',
      phonetic: 'Namaste! Could you please help me with directions?',
      literalMeaning: 'Polite greeting and inquiry for guidance',
      culturalTip: 'Saying "Namaste" before an English question establishes cordial cultural respect.'
    }
  }
};
