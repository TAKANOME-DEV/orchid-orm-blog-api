import { testRequest } from '@/test/testRequest';
import { userFactory } from '@/test/testFactories';
import { db } from '@/db';
import { verifyToken } from '@/lib/jwt';
import { comparePassword } from '@/lib/password';

describe('user controller', () => {
  describe('POST /users', () => {
    // pick params to use for this request
    const params = userFactory.pick({
      username: true,
      email: true,
      password: true,
    });

    it('should register a new user, save it with hashed password, return a user and a token', async () => {
      // build an object with randomly generated data
      const data = params.build();

      // perform a POST request to the /users endpoint with the data
      const res = await testRequest.post('/users', data);

      // ensure that response has a correct data
      const json = res.json();
      expect(json).toMatchObject({
        user: {
          username: data.username,
          email: data.email,
        },
        token: expect.any(String),
      });

      // check that the user was saved to the database with the correct fields
      const savedUser = await db.user.findBy({ username: data.username });
      expect(savedUser).toMatchObject({
        username: data.username,
        email: data.email,
      });

      // ensure that we don't store plain text passwords to the database
      expect(savedUser.password).not.toBe(data.password);
      expect(verifyToken(json.token)).toMatchObject({ id: savedUser.id });
      expect(comparePassword(data.password, savedUser.password));
    });

    it('should return error when username is taken', async () => {
      // build new randomly generated params
      const data = params.build();
      // create a new user with this specific username
      await userFactory.create({ username: data.username });

      // perform request
      const res = await testRequest.post('/users', data);

      // expect error because a user with such username was created before the request
      expect(res.json()).toMatchObject({
        error: 'Username is already taken',
      });
    });

    // similar to username test
    it('should return error when email is taken', async () => {
      const data = params.build();
      await userFactory.create({ email: data.email });

      const res = await testRequest.post('/users', data);

      expect(res.json()).toMatchObject({
        error: 'Email is already taken',
      });
    });
  });
});