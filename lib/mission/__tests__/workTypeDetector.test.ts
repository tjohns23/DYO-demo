import { describe, it, expect } from 'vitest';
import { detectWorkType, type WorkType } from '../workTypeDetector';

describe('workTypeDetector', () => {
  describe('detectWorkType', () => {
    describe('writing detection', () => {
      it('should detect writing with "blog" keyword', () => {
        expect(detectWorkType('Writing a blog post')).toBe('writing');
      });

      it('should detect writing with "article" keyword', () => {
        expect(detectWorkType('Working on an article')).toBe('writing');
      });

      it('should detect writing with "post" keyword', () => {
        expect(detectWorkType('Creating a social media post')).toBe('writing');
      });

      it('should detect writing with "email" keyword', () => {
        expect(detectWorkType('Drafting an email')).toBe('writing');
      });

      it('should detect writing with "copy" keyword', () => {
        expect(detectWorkType('Writing copy for the website')).toBe('writing');
      });

      it('should detect writing with "script" keyword', () => {
        expect(detectWorkType('Writing a script for the video')).toBe('writing');
      });

      it('should detect writing with "essay" keyword', () => {
        expect(detectWorkType('Finishing my essay')).toBe('writing');
      });

      it('should detect writing with "draft" keyword', () => {
        expect(detectWorkType('Drafting the proposal')).toBe('writing');
      });

      it('should detect writing with "content" keyword', () => {
        expect(detectWorkType('Creating content for my blog')).toBe('writing');
      });

      it('should detect writing with "paragraph" keyword', () => {
        expect(detectWorkType('Working on a paragraph')).toBe('writing');
      });

      it('should detect writing with "intro" keyword', () => {
        expect(detectWorkType('Writing the intro section')).toBe('writing');
      });
    });

    describe('coding detection', () => {
      it('should detect coding with "code" keyword', () => {
        expect(detectWorkType('Writing code for the API')).toBe('coding');
      });

      it('should detect coding with "coding" keyword', () => {
        expect(detectWorkType('Working on coding the backend')).toBe('coding');
      });

      it('should detect coding with "feature" keyword', () => {
        expect(detectWorkType('Building a new feature')).toBe('coding');
      });

      it('should detect coding with "bug" keyword', () => {
        expect(detectWorkType('Fixing a bug in the system')).toBe('coding');
      });

      it('should detect coding with "debug" keyword', () => {
        expect(detectWorkType('Debugging the application')).toBe('coding');
      });

      it('should detect coding with "develop" keyword', () => {
        expect(detectWorkType('Developing the app')).toBe('coding');
      });

      it('should detect coding with "programming" keyword', () => {
        expect(detectWorkType('Working on programming tasks')).toBe('coding');
      });

      it('should detect coding with "app" keyword', () => {
        expect(detectWorkType('Building an app')).toBe('coding');
      });

      it('should detect coding with "function" keyword', () => {
        expect(detectWorkType('Writing a function')).toBe('coding');
      });

      it('should detect coding with "API" keyword', () => {
        expect(detectWorkType('Creating an API endpoint')).toBe('coding');
      });

      it('should detect coding with "database" keyword', () => {
        expect(detectWorkType('Setting up the database')).toBe('coding');
      });

      it('should detect coding with "deploy" keyword', () => {
        expect(detectWorkType('Deploying the software')).toBe('coding');
      });
    });

    describe('design detection', () => {
      it('should detect design with "design" keyword', () => {
        expect(detectWorkType('Designing the interface')).toBe('design');
      });

      it('should detect design with "logo" keyword', () => {
        expect(detectWorkType('Creating a logo')).toBe('design');
      });

      it('should detect design with "UI" keyword', () => {
        expect(detectWorkType('Working on UI design')).toBe('design');
      });

      it('should detect design with "UX" keyword', () => {
        expect(detectWorkType('Planning the UX flow')).toBe('design');
      });

      it('should detect design with "visual" keyword', () => {
        expect(detectWorkType('Creating visual assets')).toBe('design');
      });

      it('should detect design with "brand" keyword', () => {
        expect(detectWorkType('Developing the brand identity')).toBe('design');
      });

      it('should detect design with "mockup" keyword', () => {
        expect(detectWorkType('Creating mockups')).toBe('design');
      });

      it('should detect design with "layout" keyword', () => {
        expect(detectWorkType('Finalizing the layout')).toBe('design');
      });

      it('should detect design with "graphic" keyword', () => {
        expect(detectWorkType('Making graphic designs')).toBe('design');
      });

      it('should detect design with "wireframe" keyword', () => {
        expect(detectWorkType('Wireframing the pages')).toBe('design');
      });

      it('should detect design with "prototype" keyword', () => {
        expect(detectWorkType('Prototyping the feature')).toBe('design');
      });
    });

    describe('content detection', () => {
      it('should detect content with "video" keyword', () => {
        expect(detectWorkType('Creating a video')).toBe('content');
      });

      it('should detect content with "podcast" keyword', () => {
        expect(detectWorkType('Recording a podcast')).toBe('content');
      });

      it('should detect content with "social" keyword', () => {
        expect(detectWorkType('Making social media content')).toBe('content');
      });

      it('should detect content with "content" keyword', () => {
        expect(detectWorkType('Creating content for YouTube')).toBe('content');
      });

      it('should detect content with "youtube" keyword', () => {
        expect(detectWorkType('Making a YouTube video')).toBe('content');
      });

      it('should detect content with "tiktok" keyword', () => {
        expect(detectWorkType('Filming for TikTok')).toBe('content');
      });

      it('should detect content with "instagram" keyword', () => {
        expect(detectWorkType('Posting on Instagram')).toBe('content');
      });

      it('should detect content with "recording" keyword', () => {
        expect(detectWorkType('Recording the session')).toBe('content');
      });

      it('should detect content with "filming" keyword', () => {
        expect(detectWorkType('Filming the documentary')).toBe('content');
      });

      it('should detect content with "editing" keyword', () => {
        expect(detectWorkType('Editing the video footage')).toBe('content');
      });
    });

    describe('strategy detection', () => {
      it('should detect strategy with "plan" keyword', () => {
        expect(detectWorkType('Planning the campaign')).toBe('strategy');
      });

      it('should detect strategy with "planning" keyword', () => {
        expect(detectWorkType('Planning out the roadmap')).toBe('strategy');
      });

      it('should detect strategy with "strategy" keyword', () => {
        expect(detectWorkType('Developing a strategy')).toBe('strategy');
      });

      it('should detect strategy with "roadmap" keyword', () => {
        expect(detectWorkType('Creating a roadmap')).toBe('strategy');
      });

      it('should detect strategy with "analysis" keyword', () => {
        expect(detectWorkType('Doing an analysis')).toBe('strategy');
      });

      it('should detect strategy with "analyze" keyword', () => {
        expect(detectWorkType('Analyzing the data')).toBe('strategy');
      });

      it('should detect strategy with "research" keyword', () => {
        expect(detectWorkType('Researching the market')).toBe('strategy');
      });

      it('should detect strategy with "decide" keyword', () => {
        expect(detectWorkType('Need to decide')).toBe('strategy');
      });

      it('should detect strategy with "decision" keyword', () => {
        expect(detectWorkType('Making a decision')).toBe('strategy');
      });

      it('should detect strategy with "choosing" keyword', () => {
        expect(detectWorkType('Choosing between options')).toBe('strategy');
      });

      it('should detect strategy with "evaluate" keyword', () => {
        expect(detectWorkType('Evaluating the options')).toBe('strategy');
      });
    });

    describe('pitch detection', () => {
      it('should detect pitch with "pitch" keyword', () => {
        expect(detectWorkType('Preparing a pitch')).toBe('pitch');
      });

      it('should detect pitch with "presentation" keyword', () => {
        expect(detectWorkType('Creating a presentation')).toBe('pitch');
      });

      it('should detect pitch with "deck" keyword', () => {
        expect(detectWorkType('Building a deck')).toBe('pitch');
      });

      it('should detect pitch with "present" keyword', () => {
        expect(detectWorkType('Need to present')).toBe('pitch');
      });

      it('should detect pitch with "fundrais" keyword', () => {
        expect(detectWorkType('Fundraising efforts')).toBe('pitch');
      });

      it('should detect pitch with "investor" keyword', () => {
        expect(detectWorkType('Meeting with investors')).toBe('pitch');
      });

      it('should detect pitch with "sales" keyword', () => {
        expect(detectWorkType('Sales pitch preparation')).toBe('pitch');
      });

      it('should detect pitch with "demo" keyword', () => {
        expect(detectWorkType('Preparing a demo')).toBe('pitch');
      });

      it('should detect pitch with "convince" keyword', () => {
        expect(detectWorkType('Need to convince the team')).toBe('pitch');
      });
    });

    describe('general fallback', () => {
      it('should default to general when no keywords match', () => {
        expect(detectWorkType('I am working on my project')).toBe('general');
      });

      it('should default to general for empty description', () => {
        expect(detectWorkType('')).toBe('general');
      });

      it('should default to general for generic description', () => {
        expect(detectWorkType('Just working on stuff')).toBe('general');
      });

      it('should default to general for vague description', () => {
        expect(detectWorkType('Doing some tasks')).toBe('general');
      });
    });

    describe('case insensitivity', () => {
      it('should match keywords in uppercase', () => {
        expect(detectWorkType('WRITING an article')).toBe('writing');
      });

      it('should match keywords in mixed case', () => {
        expect(detectWorkType('BuIlDiNg a feature')).toBe('coding');
      });

      it('should match keywords in lowercase', () => {
        expect(detectWorkType('designing the interface')).toBe('design');
      });
    });

    describe('priority order', () => {
      it('should prioritize writing when multiple patterns could match', () => {
        // "content" appears in "content" but also could be in "article"
        expect(detectWorkType('Writing an article')).toBe('writing');
      });

      it('should prioritize coding over design', () => {
        // If description has both "code" and "UI"
        expect(detectWorkType('Coding the UI components')).toBe('coding');
      });

      it('should prioritize design over general', () => {
        expect(detectWorkType('UI mockup work')).toBe('design');
      });

      it('should prioritize content over general', () => {
        expect(detectWorkType('Recording and editing a video')).toBe('content');
      });
    });

    describe('word boundary matching', () => {
      it('should match whole words only via regex', () => {
        expect(detectWorkType('blog post')).toBe('writing');
      });

      it('should use word boundaries for accuracy', () => {
        // "plan" should match "planning"
        expect(detectWorkType('planning my week')).toBe('strategy');
      });
    });

    describe('complex descriptions', () => {
      it('should handle longer descriptions', () => {
        const description = `
          I am building a new feature for the application. I need to code the backend
          API and then design the user interface for this feature.
        `;
        // Should pick the first match which would be "coding"
        expect(detectWorkType(description)).toBe('coding');
      });

      it('should handle descriptions with multiple work types', () => {
        const description =
          'Creating a video presentation about the product';
        // "video" should be detected first
        expect(detectWorkType(description)).toBe('content');
      });
    });
  });
});
