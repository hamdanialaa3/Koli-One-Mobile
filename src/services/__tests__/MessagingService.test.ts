/**
 * MessagingService.test.ts — Unit tests for MessagingService
 */

// Mock Firebase before importing the service
jest.mock('../../services/firebase', () => ({
  auth: {
    currentUser: { uid: 'user-abc', displayName: 'Test User' },
  },
  rtdb: {},
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn(() => ({})),
  push: jest.fn(() => ({ key: 'msg-123' })),
  set: jest.fn(() => Promise.resolve()),
  get: jest.fn(() => Promise.resolve({ exists: () => false })),
  onValue: jest.fn((_ref: any, cb: any) => {
    cb({ forEach: () => {}, exists: () => false });
    return jest.fn();
  }),
  update: jest.fn(() => Promise.resolve()),
  serverTimestamp: jest.fn(() => 12345),
  query: jest.fn((...args: any[]) => args[0]),
  orderByChild: jest.fn(),
  limitToLast: jest.fn(),
  off: jest.fn(),
}));

import { MessagingService } from '../MessagingService';
import { set, update, push } from 'firebase/database';

describe('MessagingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateChannelId', () => {
    it('generates deterministic channel ID with sorted user IDs', () => {
      expect(MessagingService.generateChannelId(5, 2, 100)).toBe('msg_2_5_car_100');
    });

    it('is symmetric — same result regardless of user order', () => {
      const a = MessagingService.generateChannelId(10, 3, 42);
      const b = MessagingService.generateChannelId(3, 10, 42);
      expect(a).toBe(b);
      expect(a).toBe('msg_3_10_car_42');
    });

    it('includes the car ID to differentiate conversations per listing', () => {
      const withCar1 = MessagingService.generateChannelId(1, 2, 1);
      const withCar2 = MessagingService.generateChannelId(1, 2, 2);
      expect(withCar1).not.toBe(withCar2);
    });
  });

  describe('sendMessage', () => {
    it('calls push + set + update for channel metadata', async () => {
      await MessagingService.sendMessage('ch-1', {
        content: 'Hello',
        type: 'text',
        senderId: 1,
        senderFirebaseId: 'user-abc',
        recipientId: 2,
        recipientFirebaseId: 'user-xyz',
      });

      expect(push).toHaveBeenCalled();
      expect(set).toHaveBeenCalledTimes(1);
      expect(update).toHaveBeenCalledTimes(1);

      // Verify message shape
      const setCall = (set as jest.Mock).mock.calls[0][1];
      expect(setCall.content).toBe('Hello');
      expect(setCall.type).toBe('text');
      expect(setCall.read).toBe(false);
      expect(setCall.status).toBe('sent');
      expect(setCall.id).toBe('msg-123');
    });
  });

  describe('subscribeToMessages', () => {
    it('returns an onValue callback that parses snapshot to array', () => {
      const callback = jest.fn();
      MessagingService.subscribeToMessages('ch-1', callback);
      // onValue mock fires immediately with empty forEach
      expect(callback).toHaveBeenCalledWith([]);
    });
  });

  describe('setTyping', () => {
    it('writes typing state to RTDB', async () => {
      await MessagingService.setTyping('ch-1', true);
      expect(set).toHaveBeenCalled();
      const writtenData = (set as jest.Mock).mock.calls[0][1];
      expect(writtenData.typing).toBe(true);
    });

    it('clears typing by setting null', async () => {
      await MessagingService.setTyping('ch-1', false);
      expect(set).toHaveBeenCalledWith(expect.anything(), null);
    });
  });

  describe('subscribeToTyping', () => {
    it('calls back with empty array when no snapshot', () => {
      const callback = jest.fn();
      MessagingService.subscribeToTyping('ch-1', callback);
      expect(callback).toHaveBeenCalledWith([]);
    });
  });
});
