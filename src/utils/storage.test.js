import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getPosts,
  addPost,
  updatePost,
  removePost,
  getUsers,
  addUser,
  updateUser,
  removeUser,
  getSession,
  setSession,
  clearSession,
} from './storage.js';

describe('storage.js', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // --- Posts ---

  describe('getPosts', () => {
    it('returns an empty array when no posts exist', () => {
      expect(getPosts()).toEqual([]);
    });

    it('returns stored posts', () => {
      const posts = [
        { id: '1', title: 'Post 1', content: 'Content 1', authorId: 'u1', authorName: 'User 1', createdAt: '2024-01-01T00:00:00.000Z' },
      ];
      localStorage.setItem('writespace_posts', JSON.stringify(posts));
      expect(getPosts()).toEqual(posts);
    });

    it('returns fallback when localStorage contains invalid JSON for posts', () => {
      localStorage.setItem('writespace_posts', 'not-valid-json');
      expect(getPosts()).toEqual([]);
    });
  });

  describe('addPost', () => {
    it('adds a post to an empty list', () => {
      const post = { id: '1', title: 'Test', content: 'Body', authorId: 'u1', authorName: 'User', createdAt: '2024-01-01T00:00:00.000Z' };
      addPost(post);
      const posts = getPosts();
      expect(posts).toHaveLength(1);
      expect(posts[0]).toEqual(post);
    });

    it('appends a post to an existing list', () => {
      const post1 = { id: '1', title: 'First', content: 'A', authorId: 'u1', authorName: 'User', createdAt: '2024-01-01T00:00:00.000Z' };
      const post2 = { id: '2', title: 'Second', content: 'B', authorId: 'u2', authorName: 'User2', createdAt: '2024-01-02T00:00:00.000Z' };
      addPost(post1);
      addPost(post2);
      const posts = getPosts();
      expect(posts).toHaveLength(2);
      expect(posts[0].id).toBe('1');
      expect(posts[1].id).toBe('2');
    });
  });

  describe('updatePost', () => {
    it('updates an existing post by id', () => {
      const post = { id: '1', title: 'Old Title', content: 'Old Content', authorId: 'u1', authorName: 'User', createdAt: '2024-01-01T00:00:00.000Z' };
      addPost(post);
      updatePost('1', { title: 'New Title', content: 'New Content' });
      const posts = getPosts();
      expect(posts[0].title).toBe('New Title');
      expect(posts[0].content).toBe('New Content');
      expect(posts[0].authorId).toBe('u1');
    });

    it('does nothing when post id does not exist', () => {
      const post = { id: '1', title: 'Title', content: 'Content', authorId: 'u1', authorName: 'User', createdAt: '2024-01-01T00:00:00.000Z' };
      addPost(post);
      updatePost('nonexistent', { title: 'Updated' });
      const posts = getPosts();
      expect(posts).toHaveLength(1);
      expect(posts[0].title).toBe('Title');
    });
  });

  describe('removePost', () => {
    it('removes a post by id', () => {
      addPost({ id: '1', title: 'A', content: 'A', authorId: 'u1', authorName: 'User', createdAt: '2024-01-01T00:00:00.000Z' });
      addPost({ id: '2', title: 'B', content: 'B', authorId: 'u2', authorName: 'User2', createdAt: '2024-01-02T00:00:00.000Z' });
      removePost('1');
      const posts = getPosts();
      expect(posts).toHaveLength(1);
      expect(posts[0].id).toBe('2');
    });

    it('does nothing when removing a non-existent post id', () => {
      addPost({ id: '1', title: 'A', content: 'A', authorId: 'u1', authorName: 'User', createdAt: '2024-01-01T00:00:00.000Z' });
      removePost('nonexistent');
      expect(getPosts()).toHaveLength(1);
    });
  });

  // --- Users ---

  describe('getUsers', () => {
    it('returns an empty array when no users exist', () => {
      expect(getUsers()).toEqual([]);
    });

    it('returns stored users', () => {
      const users = [
        { id: 'u1', displayName: 'User 1', username: 'user1', password: 'pass', role: 'user', createdAt: '2024-01-01T00:00:00.000Z' },
      ];
      localStorage.setItem('writespace_users', JSON.stringify(users));
      expect(getUsers()).toEqual(users);
    });

    it('returns fallback when localStorage contains invalid JSON for users', () => {
      localStorage.setItem('writespace_users', '{broken');
      expect(getUsers()).toEqual([]);
    });
  });

  describe('addUser', () => {
    it('adds a user to an empty list', () => {
      const user = { id: 'u1', displayName: 'User 1', username: 'user1', password: 'pass', role: 'user', createdAt: '2024-01-01T00:00:00.000Z' };
      addUser(user);
      const users = getUsers();
      expect(users).toHaveLength(1);
      expect(users[0]).toEqual(user);
    });

    it('appends a user to an existing list', () => {
      const user1 = { id: 'u1', displayName: 'User 1', username: 'user1', password: 'pass1', role: 'user', createdAt: '2024-01-01T00:00:00.000Z' };
      const user2 = { id: 'u2', displayName: 'User 2', username: 'user2', password: 'pass2', role: 'user', createdAt: '2024-01-02T00:00:00.000Z' };
      addUser(user1);
      addUser(user2);
      const users = getUsers();
      expect(users).toHaveLength(2);
      expect(users[1].id).toBe('u2');
    });
  });

  describe('updateUser', () => {
    it('updates an existing user by id', () => {
      const user = { id: 'u1', displayName: 'Old Name', username: 'user1', password: 'pass', role: 'user', createdAt: '2024-01-01T00:00:00.000Z' };
      addUser(user);
      updateUser('u1', { displayName: 'New Name' });
      const users = getUsers();
      expect(users[0].displayName).toBe('New Name');
      expect(users[0].username).toBe('user1');
    });

    it('does nothing when user id does not exist', () => {
      const user = { id: 'u1', displayName: 'Name', username: 'user1', password: 'pass', role: 'user', createdAt: '2024-01-01T00:00:00.000Z' };
      addUser(user);
      updateUser('nonexistent', { displayName: 'Updated' });
      const users = getUsers();
      expect(users).toHaveLength(1);
      expect(users[0].displayName).toBe('Name');
    });
  });

  describe('removeUser', () => {
    it('removes a user by id', () => {
      addUser({ id: 'u1', displayName: 'User 1', username: 'user1', password: 'pass1', role: 'user', createdAt: '2024-01-01T00:00:00.000Z' });
      addUser({ id: 'u2', displayName: 'User 2', username: 'user2', password: 'pass2', role: 'user', createdAt: '2024-01-02T00:00:00.000Z' });
      removeUser('u1');
      const users = getUsers();
      expect(users).toHaveLength(1);
      expect(users[0].id).toBe('u2');
    });

    it('does nothing when removing a non-existent user id', () => {
      addUser({ id: 'u1', displayName: 'User 1', username: 'user1', password: 'pass', role: 'user', createdAt: '2024-01-01T00:00:00.000Z' });
      removeUser('nonexistent');
      expect(getUsers()).toHaveLength(1);
    });
  });

  // --- Session ---

  describe('getSession', () => {
    it('returns null when no session exists', () => {
      expect(getSession()).toBeNull();
    });

    it('returns stored session object', () => {
      const session = { userId: 'u1', username: 'user1', displayName: 'User 1', role: 'user' };
      localStorage.setItem('writespace_session', JSON.stringify(session));
      expect(getSession()).toEqual(session);
    });

    it('returns null when localStorage contains invalid JSON for session', () => {
      localStorage.setItem('writespace_session', 'invalid-json');
      expect(getSession()).toBeNull();
    });
  });

  describe('setSession', () => {
    it('stores a session object in localStorage', () => {
      const session = { userId: 'admin', username: 'admin', displayName: 'Admin', role: 'admin' };
      setSession(session);
      const stored = JSON.parse(localStorage.getItem('writespace_session'));
      expect(stored).toEqual(session);
    });

    it('overwrites an existing session', () => {
      const session1 = { userId: 'u1', username: 'user1', displayName: 'User 1', role: 'user' };
      const session2 = { userId: 'u2', username: 'user2', displayName: 'User 2', role: 'user' };
      setSession(session1);
      setSession(session2);
      expect(getSession()).toEqual(session2);
    });
  });

  describe('clearSession', () => {
    it('removes the session from localStorage', () => {
      const session = { userId: 'u1', username: 'user1', displayName: 'User 1', role: 'user' };
      setSession(session);
      expect(getSession()).toEqual(session);
      clearSession();
      expect(getSession()).toBeNull();
    });

    it('does nothing when no session exists', () => {
      clearSession();
      expect(getSession()).toBeNull();
    });
  });

  // --- Serialization / Deserialization ---

  describe('data serialization', () => {
    it('correctly serializes and deserializes complex post objects', () => {
      const post = {
        id: 'abc-123',
        title: 'Post with "special" characters & <html>',
        content: 'Line 1\nLine 2\n\tTabbed content',
        authorId: 'u1',
        authorName: 'Test User',
        createdAt: '2024-06-15T12:30:00.000Z',
      };
      addPost(post);
      const retrieved = getPosts();
      expect(retrieved[0]).toEqual(post);
      expect(retrieved[0].content).toContain('\n');
      expect(retrieved[0].title).toContain('"special"');
    });

    it('correctly serializes and deserializes user objects with all fields', () => {
      const user = {
        id: 'xyz-789',
        displayName: 'José García',
        username: 'jose',
        password: 'p@$$w0rd!',
        role: 'user',
        createdAt: '2024-12-25T00:00:00.000Z',
      };
      addUser(user);
      const retrieved = getUsers();
      expect(retrieved[0]).toEqual(user);
    });
  });

  // --- localStorage unavailable / error fallback ---

  describe('fallback behavior when localStorage throws', () => {
    it('getPosts returns fallback when getItem throws', () => {
      const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
      expect(getPosts()).toEqual([]);
      spy.mockRestore();
    });

    it('getUsers returns fallback when getItem throws', () => {
      const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
      expect(getUsers()).toEqual([]);
      spy.mockRestore();
    });

    it('getSession returns null when getItem throws', () => {
      const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
      expect(getSession()).toBeNull();
      spy.mockRestore();
    });

    it('addPost does not throw when setItem throws', () => {
      const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded');
      });
      expect(() => {
        addPost({ id: '1', title: 'T', content: 'C', authorId: 'u1', authorName: 'U', createdAt: '2024-01-01T00:00:00.000Z' });
      }).not.toThrow();
      spy.mockRestore();
    });

    it('addUser does not throw when setItem throws', () => {
      const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded');
      });
      expect(() => {
        addUser({ id: 'u1', displayName: 'U', username: 'u', password: 'p', role: 'user', createdAt: '2024-01-01T00:00:00.000Z' });
      }).not.toThrow();
      spy.mockRestore();
    });

    it('setSession does not throw when setItem throws', () => {
      const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded');
      });
      expect(() => {
        setSession({ userId: 'u1', username: 'u', displayName: 'U', role: 'user' });
      }).not.toThrow();
      spy.mockRestore();
    });

    it('clearSession does not throw when removeItem throws', () => {
      const spy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });
      expect(() => {
        clearSession();
      }).not.toThrow();
      spy.mockRestore();
    });

    it('removePost does not throw when setItem throws', () => {
      const spySet = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded');
      });
      expect(() => {
        removePost('1');
      }).not.toThrow();
      spySet.mockRestore();
    });

    it('removeUser does not throw when setItem throws', () => {
      const spySet = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('quota exceeded');
      });
      expect(() => {
        removeUser('u1');
      }).not.toThrow();
      spySet.mockRestore();
    });
  });
});