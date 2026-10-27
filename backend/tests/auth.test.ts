import request from 'supertest';
import app from '../src/app';

describe('Authentication API Endpoint Tests', () => {
  it('should respond to healthcheck endpoint', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.body.status).toEqual('UP');
  });

  it('should reject login with missing credentials', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({
      email: '',
      password: '',
    });
    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
  });
});
