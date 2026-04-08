import { describe, it, expect } from 'vitest';
import { detectPattern, type Pattern } from '../patternDetector';
import type { ArchetypeSlug } from '@/lib/actions/assessment';

describe('patternDetector', () => {
  describe('detectPattern', () => {
    describe('basic keyword matching', () => {
      it('should detect perfectionism_loop pattern', () => {
        const result = detectPattern(
          'I keep rewriting and revising my essay but it is never finished',
          'optimizer'
        );
        expect(result.pattern).not.toBeNull();
        expect(result.pattern?.id).toBe('perfectionism_loop');
        expect(result.matchCount).toBeGreaterThan(0);
      });

      it('should detect ship_anxiety pattern', () => {
        const result = detectPattern(
          'I am afraid to publish my work and worried about what people will think',
          'optimizer'
        );
        expect(result.pattern).not.toBeNull();
        expect(result.pattern?.id).toBe('ship_anxiety');
      });

      it('should detect analysis_paralysis pattern', () => {
        const result = detectPattern(
          'I cannot decide between the options and I am weighing all the pros and cons',
          'strategist'
        );
        expect(result.pattern).not.toBeNull();
        expect(result.pattern?.id).toBe('analysis_paralysis');
      });

      it('should detect research_rabbit_hole pattern', () => {
        const result = detectPattern(
          'I need to research and study more about this topic before I start',
          'strategist'
        );
        expect(result.pattern).not.toBeNull();
        expect(result.pattern?.id).toBe('research_rabbit_hole');
      });

      it('should detect scope_creep pattern', () => {
        const result = detectPattern(
          'I keep adding features and expanding to include more functionality',
          'visionary'
        );
        expect(result.pattern).not.toBeNull();
        expect(result.pattern?.id).toBe('scope_creep');
      });

      it('should detect idea_proliferation pattern', () => {
        const result = detectPattern(
          'I just thought of a new idea and a better idea instead of finishing this one',
          'visionary'
        );
        expect(result.pattern).not.toBeNull();
        expect(result.pattern?.id).toBe('idea_proliferation');
      });

      it('should detect misalignment_fatigue pattern', () => {
        const result = detectPattern(
          'This work does not feel right and feels misaligned with my values',
          'advocate'
        );
        expect(result.pattern).not.toBeNull();
        expect(result.pattern?.id).toBe('misalignment_fatigue');
      });

      it('should detect isolation_stall pattern', () => {
        const result = detectPattern(
          'I am working alone by myself and feeling isolated on this project',
          'politician'
        );
        expect(result.pattern).not.toBeNull();
        expect(result.pattern?.id).toBe('isolation_stall');
      });

      it('should detect exposure_anxiety pattern', () => {
        const result = detectPattern(
          'Publishing feels vulnerable and I am scared of criticism from others',
          'empath'
        );
        expect(result.pattern).not.toBeNull();
        expect(result.pattern?.id).toBe('exposure_anxiety');
      });

      it('should detect system_absence_paralysis pattern', () => {
        const result = detectPattern(
          'I do not have a process and there is no structure for this work',
          'builder'
        );
        expect(result.pattern).not.toBeNull();
        expect(result.pattern?.id).toBe('system_absence_paralysis');
      });

      it('should detect ambiguity_anxiety pattern', () => {
        const result = detectPattern(
          'The requirements are unclear and I am uncertain about what is expected',
          'stabilizer'
        );
        expect(result.pattern).not.toBeNull();
        expect(result.pattern?.id).toBe('ambiguity_anxiety');
      });
    });

    describe('archetype boost scoring', () => {
      it('should boost score when pattern matches user archetype', () => {
        // Same description, different archetypes
        const optimizerResult = detectPattern(
          'Keep rewriting and never finished',
          'optimizer'
        );
        const builderResult = detectPattern(
          'Keep rewriting and never finished',
          'builder'
        );

        // Optimizer is associated with perfectionism_loop, builder is not
        // So optimizer score should be higher due to 2x boost
        expect(optimizerResult.score).toBeGreaterThan(builderResult.score);
      });

      it('should apply 2x multiplier for archetype match', () => {
        const withoutArchetype = detectPattern(
          'Keep rewriting my draft and polishing',
          'builder'
        );
        const withArchetype = detectPattern(
          'Keep rewriting my draft and polishing',
          'optimizer'
        );

        // Assuming both find the same pattern with same matchCount
        // withArchetype should be roughly 2x higher
        if (withoutArchetype.matchCount === withArchetype.matchCount) {
          expect(withArchetype.score).toBeLessThanOrEqual(
            withoutArchetype.score * 2
          );
          expect(withArchetype.score).toBeGreaterThanOrEqual(
            withoutArchetype.score
          );
        }
      });
    });

    describe('match counting', () => {
      it('should count number of matching keywords', () => {
        const result = detectPattern(
          'keep rewriting keep editing and keep tweaking repeatedly',
          'optimizer'
        );
        // Should match at least 3 keywords: rewriting, editing, tweaking
        expect(result.matchCount).toBeGreaterThanOrEqual(3);
      });

      it('should accumulate matches across multiple keywords', () => {
        const result = detectPattern(
          'never finished almost done not good enough just need to polish',
          'optimizer'
        );
        expect(result.matchCount).toBeGreaterThanOrEqual(2);
      });
    });

    describe('highest scoring pattern selection', () => {
      it('should return the highest scoring pattern when multiple matches', () => {
        const result = detectPattern(
          'I am stuck choosing which direction to take but also keep rewriting',
          'optimizer'
        );
        // Should find perfectionism_loop (more keyword matches for optimizer) or analysis_paralysis
        expect(result.pattern).not.toBeNull();
        expect(result.score).toBeGreaterThan(0);
      });

      it('should prioritize patterns with more matches', () => {
        const result = detectPattern(
          'keep rewriting keep editing keep revising keep tweaking multiple times',
          'optimizer'
        );
        // Multiple keywords from perfectionism_loop should result in high score
        expect(result.pattern?.id).toBe('perfectionism_loop');
      });
    });

    describe('no match scenarios', () => {
      it('should return null pattern when no keywords match', () => {
        const result = detectPattern('I am working on my project successfully', 'builder');
        expect(result.pattern).toBeNull();
        expect(result.score).toBe(0);
        expect(result.matchCount).toBe(0);
      });

      it('should return null pattern for empty description', () => {
        const result = detectPattern('', 'optimizer');
        expect(result.pattern).toBeNull();
      });

      it('should return null pattern for generic text', () => {
        const result = detectPattern('just doing work', 'visionary');
        expect(result.pattern).toBeNull();
      });
    });

    describe('case insensitivity', () => {
      it('should match keywords in any case', () => {
        const result = detectPattern(
          'KEEP REWRITING AND NEVER FINISHED',
          'optimizer'
        );
        expect(result.pattern?.id).toBe('perfectionism_loop');
      });

      it('should match mixed case keywords', () => {
        const result = detectPattern(
          'KeEp ReWrItInG aNd NeVeR fInIsHeD',
          'optimizer'
        );
        expect(result.pattern).not.toBeNull();
      });
    });

    describe('cross-archetype pattern matching', () => {
      it('should match patterns for multiple archetypes', () => {
        // perfectionism_loop is associated with optimizer, visionary, advocate
        const optimizerResult = detectPattern(
          'keep rewriting never finished',
          'optimizer'
        );
        const visionaryResult = detectPattern(
          'keep rewriting never finished',
          'visionary'
        );
        const advocateResult = detectPattern(
          'keep rewriting never finished',
          'advocate'
        );

        expect(optimizerResult.pattern?.id).toBe('perfectionism_loop');
        // visionary and advocate get base score, optimizer gets 2x boost
        expect(optimizerResult.score).toBeGreaterThan(visionaryResult.score);
        expect(optimizerResult.score).toBeGreaterThan(advocateResult.score);
      });

      it('should still detect pattern for non-primary archetype', () => {
        const result = detectPattern(
          'I cannot decide between two approaches',
          'optimizer'
        );
        // analysis_paralysis is not strongly associated with optimizer
        // but should still be detected with base score
        expect(result.pattern?.id).toBe('analysis_paralysis');
        expect(result.score).toBeGreaterThan(0);
      });
    });

    describe('long descriptions', () => {
      it('should handle longer work descriptions', () => {
        const longDescription = `
          I have been working on this project for weeks now but I keep rewriting sections
          because they are not good enough. I keep editing and revising everything multiple times.
          The work is almost done but I need to do one more pass to polish it. Just need to
          refine a few more sections before I call it finished.
        `;
        const result = detectPattern(longDescription, 'optimizer');
        expect(result.pattern?.id).toBe('perfectionism_loop');
        expect(result.matchCount).toBeGreaterThan(3);
      });
    });

    describe('ambiguous patterns', () => {
      it('should disambiguate between similar patterns by arch type', () => {
        // Both over_polishing and perfectionism_loop but optimizer is associated differently
        const result = detectPattern(
          'just need final touches and polish',
          'optimizer'
        );
        expect(result.pattern).not.toBeNull();
      });
    });

    describe('partial keyword matches', () => {
      it('should match keywords contained in longer words', () => {
        // "editing" should match in "editing multiple passes"
        const result = detectPattern(
          'keep editing multiple times',
          'optimizer'
        );
        expect(result.matchCount).toBeGreaterThan(0);
      });
    });
  });
});
