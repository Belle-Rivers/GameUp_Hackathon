import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = path.resolve(__dirname, '..');

describe('Subphase 2A: Application Shell & CSS Design System', () => {
  const indexHtml = fs.readFileSync(path.join(ROOT_DIR, 'index.html'), 'utf-8');
  const stylesCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'styles.css'), 'utf-8');
  const layoutCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'layout.css'), 'utf-8');
  const componentsCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'components.css'), 'utf-8');
  const responsiveCss = fs.readFileSync(path.join(ROOT_DIR, 'css', 'responsive.css'), 'utf-8');

  describe('P2-01: Application Shell (index.html)', () => {
    it('declares HTML5 doctype and required meta tags', () => {
      expect(indexHtml).toMatch(/<!DOCTYPE html>/i);
      expect(indexHtml).toMatch(/<meta charset="UTF-8"/i);
      expect(indexHtml).toMatch(/<meta name="viewport"/i);
    });

    it('links all four CSS architecture stylesheets in order', () => {
      expect(indexHtml).toContain('href="css/styles.css"');
      expect(indexHtml).toContain('href="css/layout.css"');
      expect(indexHtml).toContain('href="css/components.css"');
      expect(indexHtml).toContain('href="css/responsive.css"');
    });

    it('loads the ES module entrypoint js/app.js', () => {
      expect(indexHtml).toMatch(/<script\s+type="module"\s+src="js\/app\.js">\s*<\/script>/);
    });

    it('contains all required top-level screen containers', () => {
      expect(indexHtml).toContain('id="screen-main-menu"');
      expect(indexHtml).toContain('id="screen-gameplay"');
      expect(indexHtml).toContain('id="screen-game-over"');
      expect(indexHtml).toContain('id="summary-modal"');
    });

    it('contains top-bar with all city meters and shift timer', () => {
      expect(indexHtml).toContain('id="top-bar"');
      expect(indexHtml).toContain('id="meter-netzero-container"');
      expect(indexHtml).toContain('id="meter-budget-container"');
      expect(indexHtml).toContain('id="meter-trust-container"');
      expect(indexHtml).toContain('id="timer-container"');
    });

    it('contains the three-column workspace and its three panels', () => {
      expect(indexHtml).toContain('id="workspace"');
      expect(indexHtml).toContain('id="rulebook-panel"');
      expect(indexHtml).toContain('id="dossier-panel"');
      expect(indexHtml).toContain('id="action-panel"');
    });
  });

  describe('P2-02: CSS Design System (css/styles.css & css/components.css)', () => {
    it('defines PRD-mandated color tokens and surfaces', () => {
      expect(stylesCss).toContain('--bg-app: #0f172a');
      expect(stylesCss).toContain('--surface-panel: #1e293b');
      expect(stylesCss).toContain('--surface-card: #334155');
      expect(stylesCss).toContain('--paper-dossier: #f8fafc');
      expect(stylesCss).toContain('--paper-text: #0f172a');
      expect(stylesCss).toContain('--accent-cyan: #06b6d4');
      expect(stylesCss).toContain('--accent-gold: #f59e0b');
    });

    it('defines stamp action color tokens', () => {
      expect(stylesCss).toContain('--stamp-approve-bg: #10b981');
      expect(stylesCss).toContain('--stamp-fine-bg: #ef4444');
      expect(stylesCss).toContain('--stamp-grant-bg: #0284c7');
    });

    it('defines PRD typography tokens', () => {
      expect(stylesCss).toContain('--font-mono:');
      expect(stylesCss).toContain('JetBrains Mono');
      expect(stylesCss).toContain('--font-sans:');
      expect(stylesCss).toContain('Inter');
    });

    it('implements reusable component classes in components.css', () => {
      expect(componentsCss).toContain('.badge');
      expect(componentsCss).toContain('.badge-gold');
      expect(componentsCss).toContain('.badge-cyan');
      expect(componentsCss).toContain('.btn');
      expect(componentsCss).toContain('.btn-primary');
      expect(componentsCss).toContain('.panel');
      expect(componentsCss).toContain('.card');
      expect(componentsCss).toContain('.meter-widget');
      expect(componentsCss).toContain('.stamp-action-dock');
      expect(componentsCss).toContain('.stamp-btn');
      expect(componentsCss).toContain('.stamp-btn--approve');
      expect(componentsCss).toContain('.stamp-btn--fine');
      expect(componentsCss).toContain('.stamp-btn--grant');
      expect(componentsCss).toContain('.modal-backdrop');
    });
  });

  describe('P2-03: Three-Column Workspace (css/layout.css)', () => {
    it('enforces fixed full-viewport app container', () => {
      expect(layoutCss).toContain('.app-root');
      expect(layoutCss).toMatch(/width:\s*100vw;/);
      expect(layoutCss).toMatch(/height:\s*100vh;/);
      expect(layoutCss).toMatch(/overflow:\s*hidden;/);
    });

    it('implements CSS Grid 3-column layout on #workspace', () => {
      expect(layoutCss).toContain('.workspace-grid');
      expect(layoutCss).toMatch(/display:\s*grid;/);
      expect(layoutCss).toMatch(/grid-template-columns:/);
    });

    it('defines rules for the three panels', () => {
      expect(layoutCss).toContain('.rulebook-panel');
      expect(layoutCss).toContain('.dossier-panel');
      expect(layoutCss).toContain('.action-panel');
    });

    it('manages active and inactive screen visibility', () => {
      expect(layoutCss).toMatch(/\.screen\s*\{[^}]*display:\s*none;/);
      expect(layoutCss).toMatch(/\.screen\.active\s*\{[^}]*display:\s*flex;/);
    });
  });

  describe('P2-04: Responsive Layout (css/responsive.css)', () => {
    it('defines media queries for tablet and medium screens', () => {
      expect(responsiveCss).toMatch(/@media[^{]*max-width:\s*1280px/);
      expect(responsiveCss).toMatch(/@media[^{]*max-width:\s*1024px/);
    });

    it('defines media queries for mobile and narrow screens', () => {
      expect(responsiveCss).toMatch(/@media[^{]*max-width:\s*768px/);
      expect(responsiveCss).toMatch(/@media[^{]*max-width:\s*480px/);
    });

    it('adapts layout for short viewport heights', () => {
      expect(responsiveCss).toMatch(/@media[^{]*max-height:\s*720px/);
    });

    it('includes accessibility support for reduced motion', () => {
      expect(responsiveCss).toContain('prefers-reduced-motion');
    });
  });
});

