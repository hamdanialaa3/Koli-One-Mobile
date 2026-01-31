import React from 'react';
import WizardOrchestrator from '@/components/sell/WizardOrchestrator';

/**
 * Sell Tab - Main Entry Point
 * Now delegated to the modular WizardOrchestrator for functional parity with Web.
 * 🚗 7-Step Premium Wizard Implementation
 */
export default function SellScreen() {
  return <WizardOrchestrator />;
}
