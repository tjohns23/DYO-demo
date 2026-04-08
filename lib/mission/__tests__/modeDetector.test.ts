import { describe, it, expect } from 'vitest';
import { detectMode, type Mode } from '../modeDetector';

describe('modeDetector', () => {
  describe('detectMode', () => {
    describe('IDEATE mode', () => {
      it('should detect IDEATE with "choosing" keyword', () => {
        expect(detectMode('I am choosing between two approaches')).toBe('IDEATE');
      });

      it('should detect IDEATE with "deciding" keyword', () => {
        expect(detectMode('Still deciding on the best strategy')).toBe('IDEATE');
      });

      it('should detect IDEATE with "which direction" keyword', () => {
        expect(detectMode('Figuring out which direction to take')).toBe('IDEATE');
      });

      it('should detect IDEATE with "what to" keyword', () => {
        expect(detectMode('Not sure what to do next')).toBe('IDEATE');
      });

      it('should detect IDEATE with "picking" keyword', () => {
        expect(detectMode('Picking between three different options')).toBe('IDEATE');
      });

      it('should detect IDEATE with "should i" keyword', () => {
        expect(detectMode('Should I go with plan A or plan B?')).toBe('IDEATE');
      });
    });

    describe('CREATE mode', () => {
      it('should detect CREATE with "building" keyword', () => {
        expect(detectMode('I am building a new feature')).toBe('CREATE');
      });

      it('should detect CREATE with "making" keyword', () => {
        expect(detectMode('Making progress on the design')).toBe('CREATE');
      });

      it('should detect CREATE with "creating" keyword', () => {
        expect(detectMode('Creating content for the blog')).toBe('CREATE');
      });

      it('should detect CREATE with "writing" keyword', () => {
        expect(detectMode('Writing the documentation')).toBe('CREATE');
      });

      it('should detect CREATE with "designing" keyword', () => {
        expect(detectMode('Designing the user interface')).toBe('CREATE');
      });

      it('should detect CREATE with "coding" keyword', () => {
        expect(detectMode('Coding the backend API')).toBe('CREATE');
      });

      it('should detect CREATE with "working on" keyword', () => {
        expect(detectMode('Working on the presentation')).toBe('CREATE');
      });

      it('should detect CREATE with "drafting" keyword', () => {
        expect(detectMode('Drafting the proposal')).toBe('CREATE');
      });
    });

    describe('EXECUTE mode', () => {
      it('should detect EXECUTE with "finishing" keyword', () => {
        expect(detectMode('Finishing up the project')).toBe('EXECUTE');
      });

      it('should detect EXECUTE with "shipping" keyword', () => {
        expect(detectMode('Ready to ship the release')).toBe('EXECUTE');
      });

      it('should detect EXECUTE with "publishing" keyword', () => {
        expect(detectMode('Publishing the article tomorrow')).toBe('EXECUTE');
      });

      it('should detect EXECUTE with "launching" keyword', () => {
        expect(detectMode('Launching the product')).toBe('EXECUTE');
      });

      it('should detect EXECUTE with "completing" keyword', () => {
        expect(detectMode('Completing the final touches')).toBe('EXECUTE');
      });

      it('should detect EXECUTE with "wrapping up" keyword', () => {
        expect(detectMode('Wrapping up the implementation')).toBe('EXECUTE');
      });

      it('should detect EXECUTE with "almost done" keyword', () => {
        expect(detectMode('Almost done with the deployment')).toBe('EXECUTE');
      });

      it('should detect EXECUTE with "ready to" keyword', () => {
        expect(detectMode('Ready to submit the proposal')).toBe('EXECUTE');
      });
    });

    describe('case insensitivity', () => {
      it('should detect IDEATE with uppercase keyword', () => {
        expect(detectMode('CHOOSING between options')).toBe('IDEATE');
      });

      it('should detect CREATE with mixed case keyword', () => {
        expect(detectMode('Currently BuIlDiNg the feature')).toBe('CREATE');
      });

      it('should detect EXECUTE with uppercase keyword', () => {
        expect(detectMode('LAUNCHING next week')).toBe('EXECUTE');
      });
    });

    describe('default behavior', () => {
      it('should default to CREATE when no keywords match', () => {
        expect(detectMode('I am working on something')).toBe('CREATE');
      });

      it('should default to CREATE for empty string', () => {
        expect(detectMode('')).toBe('CREATE');
      });

      it('should default to CREATE for generic text', () => {
        expect(detectMode('Just doing my job')).toBe('CREATE');
      });
    });

    describe('priority and first match', () => {
      it('should return IDEATE if IDEATE keywords appear before CREATE keywords', () => {
        const result = detectMode('Deciding what to build next');
        expect(result).toBe('IDEATE');
      });

      it('should prioritize first matching keyword group', () => {
        // Testing that it checks IDEATE first, then EXECUTE, then CREATE
        const ideateFirst = detectMode('deciding between shipping now or later');
        expect(ideateFirst).toBe('IDEATE');
      });
    });

    describe('multi-keyword descriptions', () => {
      it('should match when multiple keywords of same mode are present', () => {
        expect(detectMode('Still deciding and choosing between options')).toBe('IDEATE');
      });

      it('should match when description contains multiple keywords', () => {
        expect(detectMode('Trying to decide which direction and what to build')).toBe('IDEATE');
      });
    });
  });
});
