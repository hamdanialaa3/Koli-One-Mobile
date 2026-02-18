# Koli One Mobile — Testing Guide

## Overview

The mobile app (`mobile_new/`) uses **Jest** with **React Native Testing Library** for unit and component tests.

## Quick Commands

```bash
cd mobile_new

# Run all tests
npx jest

# Run with coverage
npx jest --coverage

# Run a specific test file
npx jest src/services/__tests__/MessagingService.test.ts

# Watch mode
npx jest --watch
```

## Test Structure

```
mobile_new/
├── src/
│   ├── services/
│   │   └── __tests__/
│   │       ├── MessagingService.test.ts
│   │       └── ListingService.test.ts
│   └── hooks/
│       └── __tests__/
│           └── useMobileSearch.test.ts
└── jest.config.js (or in package.json)
```

## Writing Tests

### Service Tests

```typescript
import { MessagingService } from '../MessagingService';

describe('MessagingService', () => {
  it('generates deterministic channel IDs', () => {
    const id = MessagingService.generateChannelId(1, 2, 100);
    expect(id).toBe('msg_1_2_car_100');
  });
});
```

### Hook Tests

Use `@testing-library/react-hooks` or `renderHook` from `@testing-library/react-native`:

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useMobileSearch } from '../useMobileSearch';

describe('useMobileSearch', () => {
  it('initializes with default filters', () => {
    const { result } = renderHook(() => useMobileSearch());
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});
```

## Coverage Target

| Area       | Current | Target |
|------------|---------|--------|
| Services   | ~40%    | ≥ 50%  |
| Hooks      | ~30%    | ≥ 40%  |
| Components | ~10%    | ≥ 20%  |

## CI Integration

Tests run automatically on every push/PR to `main` and `feat/mobile/**` branches via `.github/workflows/mobile-ci.yml`.

Coverage reports are uploaded as build artifacts.

## Mocking Firebase

All Firebase calls should be mocked in tests:

```typescript
jest.mock('../../services/firebase', () => ({
  db: {},
  auth: { currentUser: { uid: 'test-uid', displayName: 'Test' } },
  rtdb: {},
  storage: {},
}));
```

## Test Environment

- **Runner**: Jest 29+
- **Transform**: babel-jest with `babel-preset-expo`
- **Platform**: Tests run in `node` environment with React Native mocks
