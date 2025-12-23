/**
 * Frontend debug logger for tracking request flow through all 15 steps
 * Coordinates with backend debug logger using shared request IDs
 */

class DebugLogger {
  constructor() {
    this.requestId = this.generateRequestId();
    this.startTime = Date.now();
    this.steps = [];
    this.errors = [];
    this.isEnabled = true; // Set to false to disable debug logging

    if (this.isEnabled) {
      console.log('%c========================================', 'color: #10b981; font-weight: bold');
      console.log('%cDEBUG SESSION STARTED (FRONTEND)', 'color: #10b981; font-weight: bold');
      console.log('%c========================================', 'color: #10b981; font-weight: bold');
      console.log(`%cRequest ID: ${this.requestId}`, 'color: #10b981');
      console.log(`%cTimestamp: ${new Date().toISOString()}`, 'color: #10b981');
      console.log('%c========================================', 'color: #10b981; font-weight: bold');
    }
  }

  generateRequestId() {
    return `fe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  logStep(stepNumber, status = 'completed', details = {}, error = null) {
    if (!this.isEnabled) return;

    const currentTime = Date.now();
    const durationMs = currentTime - this.startTime;

    const stepInfo = {
      stepNumber,
      stepName: this.getStepName(stepNumber),
      status,
      timestamp: new Date().toISOString(),
      durationFromStartMs: durationMs,
      details,
      error,
    };

    this.steps.push(stepInfo);

    const statusSymbols = {
      started: '▶',
      completed: '✓',
      failed: '✗',
    };

    const statusColors = {
      started: '#3b82f6',
      completed: '#10b981',
      failed: '#ef4444',
    };

    const symbol = statusSymbols[status] || '•';
    const color = statusColors[status] || '#6b7280';

    console.log(
      `%c${symbol} Step ${stepNumber}: ${stepInfo.stepName}`,
      `color: ${color}; font-weight: bold`
    );
    console.log(`  Status: ${status.toUpperCase()}`);
    console.log(`  Duration from start: ${durationMs}ms`);

    if (Object.keys(details).length > 0) {
      console.log('  Details:', details);
    }

    if (error) {
      console.error(`  ERROR: ${error}`);
    }

    if (status === 'failed' && error) {
      this.errors.push({
        step: stepNumber,
        stepName: stepInfo.stepName,
        error,
        timestamp: stepInfo.timestamp,
      });
    }
  }

  finalize(success = true) {
    if (!this.isEnabled) return;

    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;

    console.log('\n%c========================================', 'color: #10b981; font-weight: bold');
    console.log('%cDEBUG SESSION ENDED (FRONTEND)', 'color: #10b981; font-weight: bold');
    console.log('%c========================================', 'color: #10b981; font-weight: bold');
    console.log(`%cRequest ID: ${this.requestId}`, 'color: #10b981');
    console.log(`%cStatus: ${success ? 'SUCCESS' : 'FAILED'}`, `color: ${success ? '#10b981' : '#ef4444'}`);
    console.log(`%cTotal Duration: ${totalDuration}ms`, 'color: #10b981');
    console.log(`%cErrors: ${this.errors.length}`, 'color: #10b981');

    if (this.errors.length > 0) {
      console.log('\n%cERRORS ENCOUNTERED:', 'color: #ef4444; font-weight: bold');
      this.errors.forEach((err) => {
        console.error(`  • Step ${err.step}: ${err.error}`);
      });
    }

    console.log('%c========================================\n', 'color: #10b981; font-weight: bold');

    // Store in session storage for debugging
    try {
      const sessionData = {
        requestId: this.requestId,
        startTime: this.startTime,
        endTime,
        totalDuration,
        success,
        steps: this.steps,
        errors: this.errors,
      };

      const recentSessions = JSON.parse(sessionStorage.getItem('debug_sessions') || '[]');
      recentSessions.push(sessionData);

      // Keep only last 10 sessions
      if (recentSessions.length > 10) {
        recentSessions.shift();
      }

      sessionStorage.setItem('debug_sessions', JSON.stringify(recentSessions));
    } catch (e) {
      console.warn('Could not store debug session in sessionStorage', e);
    }
  }

  getStepName(stepNumber) {
    const steps = {
      1: 'User uploads images',
      2: 'FRONTEND compresses images (2MB max)',
      3: 'User adds annotations (club, outcome, focus, notes)',
      4: 'Frontend sends FormData to BACKEND',
      5: 'BACKEND validates images (5MB max, MIME types)',
      6: 'BACKEND converts to base64 + detects formats',
      7: 'BACKEND fetches last 3 swings from DATABASE',
      8: 'BACKEND builds intelligent prompt with history',
      9: 'BACKEND calls Claude API (Haiku model)',
      10: 'CLAUDE analyzes swing + compares to history',
      11: 'BACKEND parses response (extract rating + summary)',
      12: 'BACKEND saves complete record to DATABASE',
      13: 'BACKEND returns structured response to FRONTEND',
      14: 'FRONTEND updates SwingContext state',
      15: 'FRONTEND displays AnalysisResults component',
    };

    return steps[stepNumber] || `Unknown step ${stepNumber}`;
  }

  getRequestId() {
    return this.requestId;
  }

  getSummary() {
    return {
      requestId: this.requestId,
      startTime: this.startTime,
      steps: this.steps,
      errors: this.errors,
    };
  }
}

// Utility to view recent debug sessions
export function viewRecentDebugSessions() {
  try {
    const sessions = JSON.parse(sessionStorage.getItem('debug_sessions') || '[]');
    console.table(sessions.map(s => ({
      RequestID: s.requestId,
      Status: s.success ? 'SUCCESS' : 'FAILED',
      Duration: `${s.totalDuration}ms`,
      Steps: s.steps.length,
      Errors: s.errors.length,
      Time: new Date(s.startTime).toLocaleTimeString(),
    })));
    return sessions;
  } catch (e) {
    console.error('Could not load debug sessions', e);
    return [];
  }
}

// Make viewRecentDebugSessions available globally for easy console access
if (typeof window !== 'undefined') {
  window.viewDebugSessions = viewRecentDebugSessions;
}

export default DebugLogger;
