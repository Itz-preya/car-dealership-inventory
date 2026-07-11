import request from 'supertest';
import app from '../app';
import jwt from 'jsonwebtoken';

describe('ASR Transcribe API', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'secret';
  let token: string;

  beforeAll(() => {
    // Generate a valid JWT token for testing ASR authorization
    token = jwt.sign(
      { id: 'test-user-id', role: 'USER' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  describe('POST /api/asr/transcribe', () => {
    it('should upload an audio file and return 202 with processing status', async () => {
      const mockAudioContent = Buffer.from('mock-wav-audio-content');

      const response = await request(app)
        .post('/api/asr/transcribe')
        .set('Authorization', `Bearer ${token}`)
        .attach('audio', mockAudioContent, 'sample.wav');

      expect(response.status).toBe(202);
      expect(response.body).toHaveProperty('jobId');
      expect(response.body).toHaveProperty('file');
      expect(response.body.file).toHaveProperty('name', 'sample.wav');
      expect(response.body.status).toBe('PROCESSING');
    });
  });
});
