const request = require('supertest');
const app = require('./server');

describe('users app', () => {
  describe('users get', () => {
    it('should return users list', async () => {
      await request(app).post('/users').send({
        email: 'foo',
        name: 'foo',
      });
      const res = await request(app).get('/users').send();

      expect(res.body.length).toBe(1);
    });

    it('should create user', async () => {
      const res = await request(app).post('/users').send({
        email: 'foo',
        name: 'foo',
      });

      expect(res.body).toEqual(
        expect.objectContaining({
          email: 'foo',
          name: 'foo',
        })
      );
      expect(res.body.id).toBeDefined();
      expect(typeof res.body.id).toBe('string');
    });
  });
});
