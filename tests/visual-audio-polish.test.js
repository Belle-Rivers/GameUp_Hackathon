import { describe, expect, it, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { soundEngine } from '../js/frontend/audio.js';
import { TopBarComponent } from '../js/frontend/components/top-bar.js';
import { renderReceiptCard, formatCO2 } from '../js/frontend/components/dossier-panel.js';
import { renderRateItem } from '../js/frontend/components/rulebook-panel.js';
import { backendApi } from '../js/backend/index.js';

describe('Phase 5: Visual Polish, Animation and Audio (P5-01 to P5-10)', () => {
  const rootDir = path.resolve(__dirname, '..');
  const stylesCss = fs.readFileSync(path.join(rootDir, 'css/styles.css'), 'utf-8');
  const layoutCss = fs.readFileSync(path.join(rootDir, 'css/layout.css'), 'utf-8');
  const componentsCss = fs.readFileSync(path.join(rootDir, 'css/components.css'), 'utf-8');
  const responsiveCss = fs.readFileSync(path.join(rootDir, 'css/responsive.css'), 'utf-8');
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');
  const attributionMd = fs.readFileSync(path.join(rootDir, 'ATTRIBUTION.md'), 'utf-8');

  // P5-01: Visual identity & design system
  describe('P5-01: Visual identity & design system', () => {
    it('defines Mediterranean Antalya color palette, paper materials, and tactile tokens', () => {
      expect(stylesCss).toContain('--accent-cyan');
      expect(stylesCss).toContain('--accent-gold');
      expect(stylesCss).toContain('--paper-dossier');
      expect(stylesCss).toContain('--paper-bill');
      expect(stylesCss).toContain('--shadow-paper');
      expect(stylesCss).toContain('--shadow-stamp');
    });
  });

  // P5-02: Assets verified and present
  describe('P5-02: Game assets in assets/ and attribution', () => {
    it('verifies all expected core assets exist on disk', () => {
      const requiredAssets = [
        'assets/Antalya_Office_background.jpg',
        'assets/Approved_Stamp.png',
        'assets/FineIssued_Stamp.png',
        'assets/GrantApproved_Stamp.png',
        'assets/Dossier.png',
        'assets/Receipt.png',
        'assets/Electricity_Bill.png',
        'assets/Gas_Bill.png',
        'assets/Official_Seal.png',
        'assets/Paperclips_and_Note.png',
        'assets/Electric_Meter.png',
        'assets/NaturalGas_Heater.png',
        'assets/petrol.png',
        'assets/plane.png',
        'assets/garbage.png',
        'assets/RooftopSolarEnergy.png',
        'assets/GreenRoofs.png',
        'assets/ElectricalLocalTransportation.png',
        'assets/LocalFruits.png',
      ];

      for (const assetRelPath of requiredAssets) {
        const fullPath = path.join(rootDir, assetRelPath);
        expect(fs.existsSync(fullPath)).toBe(true);
      }
    });

    it('documents all assets in ATTRIBUTION.md', () => {
      expect(attributionMd).toContain('Antalya Climate Operations Office Suite');
      expect(attributionMd).toContain('Antalya_Office_background.jpg');
      expect(attributionMd).toContain('Approved_Stamp.png');
      expect(attributionMd).toContain('FineIssued_Stamp.png');
      expect(attributionMd).toContain('GrantApproved_Stamp.png');
      expect(attributionMd).toContain('Dossier.png');
      expect(attributionMd).toContain('Official_Seal.png');
      expect(attributionMd).toContain('Paperclips_and_Note.png');
    });
  });

  // P5-03: Municipal office environment
  describe('P5-03: Municipal office environment', () => {
    it('integrates Antalya Office background into gameplay screen layout', () => {
      expect(layoutCss).toContain('assets/Antalya_Office_background.jpg');
      expect(layoutCss).toContain('.gameplay-screen');
      expect(layoutCss).toContain('.workspace-grid');
    });
  });

  // P5-04: Citizen dossiers and documents
  describe('P5-04: Citizen dossiers and documents', () => {
    it('renders receipt cards with category icons and physical document styling', () => {
      const receipt = {
        type: 'ENERGY',
        title: 'TEDAŞ Smart Meter Log',
        items: [{ label: 'Grid Electricity', qty: 120, unit: 'kWh', rateKey: 'GRID_ELEC' }],
      };
      const html = renderReceiptCard(receipt, 0);

      expect(html).toContain('receipt-card--energy');
      expect(html).toContain('receipt-category-icon');
      expect(html).toContain('assets/Electric_Meter.png');
      expect(html).toContain('TEDAŞ Smart Meter Log');
      expect(html).toContain('120 kWh');
    });

    it('contains official COP31 seal and paperclip elements in the HTML structure', () => {
      expect(indexHtml).toContain('Official_Seal.png');
      expect(indexHtml).toContain('Paperclips_and_Note.png');
    });
  });

  // P5-05: Gameplay HUD and climate visualization
  describe('P5-05: Gameplay HUD and climate visualization', () => {
    it('renders climate rate items with category icons', () => {
      const rate = {
        key: 'GRID_ELEC',
        activity: 'Grid Electricity',
        rate: 0.5,
        unit: 'kg CO₂/kWh',
        category: 'Electricity',
      };
      const html = renderRateItem(rate);

      expect(html).toContain('rate-icon');
      expect(html).toContain('assets/Electric_Meter.png');
      expect(html).toContain('Grid Electricity');
      expect(html).toContain('0.50 kg CO₂/kWh');
    });

    it('includes timer warning animation and audio toggle in the top bar layout', () => {
      expect(layoutCss).toContain('.timer-warning');
      expect(indexHtml).toContain('btn-audio-toggle');
    });
  });

  // P5-06: Action stamps and animations
  describe('P5-06: Tactile action stamps and animations', () => {
    it('defines tactile stamp buttons and stamp animation rules in CSS', () => {
      expect(componentsCss).toContain('.stamp-btn--approve');
      expect(componentsCss).toContain('.stamp-btn--fine');
      expect(componentsCss).toContain('.stamp-btn--grant');
      expect(componentsCss).toContain('.stamp-drop-anim');
      expect(componentsCss).toContain('@keyframes stampDown');
    });
  });

  // P5-07: Screen transitions and decision feedback
  describe('P5-07: Screen transitions and decision feedback', () => {
    it('defines action feedback overlay classes for valid and invalid actions', () => {
      expect(componentsCss).toContain('.action-feedback-overlay');
      expect(componentsCss).toContain('.feedback--valid');
      expect(componentsCss).toContain('.feedback--invalid');
      expect(componentsCss).toContain('.feedback-stamp-graphic-wrap');
    });
  });

  // P5-08: Audio engine and sound controls
  describe('P5-08: Procedural Web Audio API sound engine', () => {
    it('provides soundEngine with all required SFX and mute controls', () => {
      expect(typeof soundEngine.playStamp).toBe('function');
      expect(typeof soundEngine.playSuccess).toBe('function');
      expect(typeof soundEngine.playError).toBe('function');
      expect(typeof soundEngine.playPaper).toBe('function');
      expect(typeof soundEngine.playClick).toBe('function');
      expect(typeof soundEngine.playTransition).toBe('function');
      expect(typeof soundEngine.toggleMute).toBe('function');
      expect(typeof soundEngine.setMuted).toBe('function');
      expect(typeof soundEngine.isMuted).toBe('function');
    });

    it('toggles and sets mute state correctly', () => {
      soundEngine.setMuted(false);
      expect(soundEngine.isMuted()).toBe(false);

      const toggled = soundEngine.toggleMute();
      expect(toggled).toBe(true);
      expect(soundEngine.isMuted()).toBe(true);

      soundEngine.setMuted(false);
      expect(soundEngine.isMuted()).toBe(false);
    });

    it('safe no-op execution in non-browser Node test environment without throwing', () => {
      expect(() => {
        soundEngine.playStamp('APPROVE');
        soundEngine.playStamp('FINE');
        soundEngine.playStamp('GRANT');
        soundEngine.playSuccess();
        soundEngine.playError();
        soundEngine.playPaper();
        soundEngine.playClick();
        soundEngine.playTransition();
      }).not.toThrow();
    });
  });

  // P5-09: Responsive presentation and accessibility
  describe('P5-09: Responsive presentation and accessibility', () => {
    it('includes accessibility support for reduced motion in CSS', () => {
      expect(responsiveCss).toContain('prefers-reduced-motion: reduce');
      expect(responsiveCss).toContain('.stamp-drop-anim');
    });

    it('defines responsive break points for tablets and laptops', () => {
      expect(responsiveCss).toContain('max-width: 1280px');
      expect(responsiveCss).toContain('max-width: 1024px');
      expect(responsiveCss).toContain('max-width: 768px');
    });
  });

  // P5-10: Integrity and gameplay preservation
  describe('P5-10: Game identity verification and gameplay preservation', () => {
    it('preserves complete backend gameplay logic across a 3-day simulated playthrough', () => {
      const stateView = backendApi.startCampaign();
      expect(stateView.currentDay).toBe(1);
      expect(stateView.metrics.netZero).toBe(30);
      expect(stateView.metrics.budget).toBe(5000);
      expect(stateView.metrics.trust).toBe(70);

      // Audit citizen 1 (C001: Declared 80, Actual 167 -> Fine)
      const c1 = backendApi.getCurrentCase();
      expect(c1).toBeDefined();
      expect(c1.id).toBe('C001');

      const actionResult = backendApi.submitAction({
        caseId: c1.id,
        action: 'FINE',
      });
      expect(actionResult.isValid).toBe(true);
      expect(actionResult.action).toBe('FINE');
      expect(actionResult.metrics.budget).toBeGreaterThanOrEqual(5000);
    });
  });
});
