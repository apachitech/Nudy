import { describe, it, expect } from "vitest";
import { validatePrompt } from "./promptFilter";

describe("Prompt Moderation Filter - Safety & Compliance Tests", () => {
  describe("Valid Adult Fictional Prompts", () => {
    it("should allow clean artistic character portraits", () => {
      const prompt = "A 24 year old adult woman with raven black hair standing on a rooftop at twilight";
      const result = validatePrompt(prompt);
      expect(result.isValid).toBe(true);
      expect(result.blocked).toBe(false);
      expect(result.category).toBeNull();
    });

    it("should allow consensual adult glamour descriptions", () => {
      const prompt = "Gorgeous 28yo woman in red silk dress, high fashion photography, studio lighting, sensual pose";
      const result = validatePrompt(prompt);
      expect(result.isValid).toBe(true);
      expect(result.blocked).toBe(false);
    });

    it("should allow empty or whitespace prompts", () => {
      expect(validatePrompt("").isValid).toBe(true);
      expect(validatePrompt("   ").isValid).toBe(true);
    });
  });

  describe("Zero-Tolerance Underage / CSAM Blocking", () => {
    it("should block explicit underage keywords (child, teen, minor)", () => {
      const prompts = [
        "A cute child in a garden",
        "underage girl photo",
        "young minor portrait",
        "pretty teen model",
        "schoolgirl in uniform",
        "elementary school kid",
      ];

      for (const p of prompts) {
        const result = validatePrompt(p);
        expect(result.isValid).toBe(false);
        expect(result.blocked).toBe(true);
        expect(result.category).toBe("UNDERAGE_CSAM");
      }
    });

    it("should block numeric underage descriptors (e.g., 14yo, 16 year old)", () => {
      const underageAges = [
        "14yo girl smiling",
        "15 year old sitting in room",
        "age 16 anime girl",
        "17 years old character",
        "aged 12 in park",
      ];

      for (const p of underageAges) {
        const result = validatePrompt(p);
        expect(result.isValid).toBe(false);
        expect(result.blocked).toBe(true);
        expect(result.category).toBe("UNDERAGE_CSAM");
      }
    });

    it("should allow legal adult ages (>= 18)", () => {
      const adultAges = [
        "18yo woman",
        "19 year old character",
        "21yo model",
        "25 years old adult",
        "30yo woman in dress",
      ];

      for (const p of adultAges) {
        const result = validatePrompt(p);
        expect(result.isValid).toBe(true);
        expect(result.blocked).toBe(false);
      }
    });

    it("should catch leetspeak and obfuscated minor terms", () => {
      const obfuscated = [
        "und3rag3 girl",
        "t33n model",
        "l0li character",
        "sh0ta portrait",
        "c.h.i.l.d playing",
      ];

      for (const p of obfuscated) {
        const result = validatePrompt(p);
        expect(result.isValid).toBe(false);
        expect(result.blocked).toBe(true);
        expect(result.category).toBe("UNDERAGE_CSAM");
      }
    });
  });

  describe("Non-Consensual & Violence Blocking", () => {
    it("should block rape, forced, or non-consensual themes", () => {
      const badPrompts = [
        "non-consensual encounter in dark alley",
        "woman forced to undress",
        "drugged girl asleep",
        "voyeur hidden cam in bathroom",
      ];

      for (const p of badPrompts) {
        const result = validatePrompt(p);
        expect(result.isValid).toBe(false);
        expect(result.blocked).toBe(true);
        expect(result.category).toBe("NON_CONSENSUAL");
      }
    });

    it("should block extreme violence, gore, and taboo themes", () => {
      const violentPrompts = [
        "snuff scene with blood",
        "necrophilia in graveyard",
        "decapitation and severed head",
      ];

      for (const p of violentPrompts) {
        const result = validatePrompt(p);
        expect(result.isValid).toBe(false);
        expect(result.blocked).toBe(true);
        expect(result.category).toBe("EXTREME_VIOLENCE_GORE");
      }
    });

    it("should block bestiality / zoophilia", () => {
      const prompt = "woman and animal bestiality scene";
      const result = validatePrompt(prompt);
      expect(result.isValid).toBe(false);
      expect(result.blocked).toBe(true);
      expect(result.category).toBe("ILLICIT_ANIMAL_BESTIALITY");
    });
  });

  describe("Real Person / Celebrity Deepfake Blocking", () => {
    it("should block prompts containing celebrity names without consent", () => {
      const prompts = [
        "Taylor Swift in bikini on beach",
        "Emma Watson glamour portrait",
        "Sydney Sweeney smiling",
        "Donald Trump sitting at desk",
        "Elon Musk portrait",
      ];

      for (const p of prompts) {
        const result = validatePrompt(p);
        expect(result.isValid).toBe(false);
        expect(result.blocked).toBe(true);
        expect(result.category).toBe("REAL_PERSON_DEEPFAKE");
      }
    });
  });
});

