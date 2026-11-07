/**
 * Strict Multi-Stage Prompt Moderation Filter for 18+ Character Generation
 * Enforces legal compliance and zero-tolerance policies.
 */

export interface ModerationResult {
  isValid: boolean;
  blocked: boolean;
  category: ModerationCategory | null;
  flaggedTerms: string[];
  reason: string | null;
}

export type ModerationCategory =
  | "UNDERAGE_CSAM"
  | "NON_CONSENSUAL"
  | "REAL_PERSON_DEEPFAKE"
  | "EXTREME_VIOLENCE_GORE"
  | "ILLICIT_ANIMAL_BESTIALITY"
  | "SELF_HARM";

// 1. UNDERAGE / MINOR KEYWORDS & PATTERNS
const UNDERAGE_PATTERNS: RegExp[] = [
  /\b(child|children|minor|minors|underage|toddler|infant|baby|babies|kid|kids)\b/i,
  /\b(teen|teens|teenager|teenagers|pubescent|prepubescent|adolescent)\b/i,
  /\b(schoolgirl|schoolboy|schoolkid|schoolchild|middle\s*school|elementary|kindergarten)\b/i,
  /\b(loli|lolita|lolicon|shota|shotacon)\b/i,
  /\b(pedophile|pedophilia|paedo|paedophile|cp)\b/i,
  /\b(young\s*girl|young\s*boy|little\s*girl|little\s*boy)\b/i,
  // Leetspeak / obfuscated patterns
  /u[n_.\-\s]*d[e3][r_.\-\s]*[a4]g[e3]/i,
  /c[h_.\-\s]*[i1l][l_.\-\s]*d/i,
  /t[e3]{2}n/i,
  /l[o0]l[i1]/i,
  /s[h_.\-\s]*[o0]t[a4]/i,
];

// Age regex: Matches patterns like "16yo", "15 year old", "age 16", "aged 12"
const UNDERAGE_EXPLICIT_AGE_PATTERNS: RegExp[] = [
  // "14yo", "15 year old", "17 years old", "9 yrs"
  /\b([1-9]|1[0-7])\s*(yo|y\/o|yrs?|years?|years?\s*old)\b/i,
  // "age 16", "aged 12", "age: 15"
  /\b(aged?|age|is)[:\s]+([1-9]|1[0-7])\b/i,
];

// 2. NON-CONSENSUAL CONTENT
const NON_CONSENSUAL_PATTERNS: RegExp[] = [
  /\b(rape|rapist|raping|non-consensual|nonconsensual|forced\s*sex|unconscious\s*sex)\b/i,
  /\b(drugged|roofied|blackmailed|coerced|sex\s*slave|forced\s*to)\b/i,
  /\b(upskirt|hidden\s*cam|spycam|peeping\s*tom|voyeur\s*shot)\b/i,
];

// 3. REAL PERSONS / CELEBRITY DEEPFAKES (Non-exhaustive high-risk protection list)
const REAL_PERSON_PATTERNS: RegExp[] = [
  /\b(taylor\s*swift|emma\s*watson|billie\s*eilish|selena\s*gomez|ariana\s*grande)\b/i,
  /\b(donald\s*trump|joe\s*biden|kamala\s*harris|barack\s*obama|elon\s*musk)\b/i,
  /\b(zelenskyy|putin|macron|scholz|sunak|starmer)\b/i,
  /\b(zendaya|scarlett\s*johansson|sydney\s*sweeney|margot\s*robbie|gal\s*gadot)\b/i,
];

// 4. EXTREME VIOLENCE, GORE & TABOO
const VIOLENCE_PATTERNS: RegExp[] = [
  /\b(snuff|necrophilia|corpse\s*sex|decapitation|mutilation|torture|dismemberment)\b/i,
  /\b(severed\s*head|guts|disembowel|blood\s*bath|execution)\b/i,
];

// 5. ANIMAL / BESTIALITY
const BESTIALITY_PATTERNS: RegExp[] = [
  /\b(bestiality|zoophilia|animal\s*sex|dog\s*knot|horse\s*cock)\b/i,
];

// 6. SELF-HARM
const SELF_HARM_PATTERNS: RegExp[] = [
  /\b(suicide|slit\s*wrists|hanging\s*herself|hanging\s*himself|self-harm)\b/i,
];

/**
 * Normalizes input text to catch punctuation spacing and leetspeak bypasses
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[@]/g, "a")
    .replace(/[$]/g, "s")
    .replace(/[0]/g, "o")
    .replace(/[1!|]/g, "i")
    .replace(/[3]/g, "e")
    .replace(/[4]/g, "a")
    .replace(/[5]/g, "s")
    .replace(/[7]/g, "t");
}

/**
 * Main prompt validation function
 */
export function validatePrompt(prompt: string): ModerationResult {
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return {
      isValid: true,
      blocked: false,
      category: null,
      flaggedTerms: [],
      reason: null,
    };
  }

  const rawText = prompt.trim();
  const normalized = normalizeText(rawText);

  // 1. Check Underage explicitly by age digits
  for (const agePattern of UNDERAGE_EXPLICIT_AGE_PATTERNS) {
    const ageMatch = rawText.match(agePattern);
    if (ageMatch) {
      return {
        isValid: false,
        blocked: true,
        category: "UNDERAGE_CSAM",
        flaggedTerms: [ageMatch[0]],
        reason: "Explicit underage reference detected. All characters must be fictional adults.",
      };
    }
  }

  // 2. Check Underage Patterns
  for (const pattern of UNDERAGE_PATTERNS) {
    const rawMatch = rawText.match(pattern);
    if (rawMatch) {
      return {
        isValid: false,
        blocked: true,
        category: "UNDERAGE_CSAM",
        flaggedTerms: [rawMatch[0]],
        reason: "Zero tolerance violation: Minor/underage themes are strictly prohibited.",
      };
    }

    const normMatch = normalized.match(pattern);
    if (normMatch) {
      return {
        isValid: false,
        blocked: true,
        category: "UNDERAGE_CSAM",
        flaggedTerms: [normMatch[0]],
        reason: "Zero tolerance violation: Obfuscated underage themes detected.",
      };
    }
  }

  // 3. Check Non-consensual
  for (const pattern of NON_CONSENSUAL_PATTERNS) {
    const match = rawText.match(pattern) || normalized.match(pattern);
    if (match) {
      return {
        isValid: false,
        blocked: true,
        category: "NON_CONSENSUAL",
        flaggedTerms: [match[0]],
        reason: "Non-consensual themes or sexual violence are strictly prohibited.",
      };
    }
  }

  // 4. Check Real Person Deepfakes
  for (const pattern of REAL_PERSON_PATTERNS) {
    const match = rawText.match(pattern) || normalized.match(pattern);
    if (match) {
      return {
        isValid: false,
        blocked: true,
        category: "REAL_PERSON_DEEPFAKE",
        flaggedTerms: [match[0]],
        reason: "Depicting real living persons or public figures is strictly prohibited. Fictional characters only.",
      };
    }
  }

  // 5. Check Extreme Violence / Gore
  for (const pattern of VIOLENCE_PATTERNS) {
    const match = rawText.match(pattern) || normalized.match(pattern);
    if (match) {
      return {
        isValid: false,
        blocked: true,
        category: "EXTREME_VIOLENCE_GORE",
        flaggedTerms: [match[0]],
        reason: "Gore, extreme violence, and taboo themes are prohibited.",
      };
    }
  }

  // 6. Check Bestiality
  for (const pattern of BESTIALITY_PATTERNS) {
    const match = rawText.match(pattern) || normalized.match(pattern);
    if (match) {
      return {
        isValid: false,
        blocked: true,
        category: "ILLICIT_ANIMAL_BESTIALITY",
        flaggedTerms: [match[0]],
        reason: "Bestiality/zoophilia content is strictly prohibited.",
      };
    }
  }

  // 7. Check Self-Harm
  for (const pattern of SELF_HARM_PATTERNS) {
    const match = rawText.match(pattern) || normalized.match(pattern);
    if (match) {
      return {
        isValid: false,
        blocked: true,
        category: "SELF_HARM",
        flaggedTerms: [match[0]],
        reason: "Self-harm depictions are strictly prohibited.",
      };
    }
  }

  return {
    isValid: true,
    blocked: false,
    category: null,
    flaggedTerms: [],
    reason: null,
  };
}
