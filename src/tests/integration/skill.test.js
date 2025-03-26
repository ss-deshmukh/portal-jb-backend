const logger = require('../../utils/logger');
const crypto = require('crypto');
const api = require('./testClient');
const { startTestServer, stopTestServer } = require('./testServer');
const mongoose = require('mongoose');

// Generate a random skill ID
const generateSkillId = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Generate test skill data
const generateTestSkillData = () => {
  return {
    name: `Test Skill ${Date.now()}`
  };
};

describe('Skill Tests', () => {
  let testSkillId;
  let adminId;

  beforeAll(async () => {
    await startTestServer();
    // Create a test admin user
    adminId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    await stopTestServer();
  });

  beforeEach(async () => {
    await api.auth.clearSession();
  });

  afterEach(async () => {
    // Clean up test data
    if (testSkillId) {
      try {
        await api.skill.delete(testSkillId);
      } catch (error) {
        logger.error('Failed to clean up test skill:', error);
      }
    }
  });

  describe('Public Endpoints', () => {
    it('should get all skills', async () => {
      try {
        const response = await api.skill.getAll();
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('skills');
        expect(Array.isArray(response.data.skills)).toBe(true);
      } catch (error) {
        if (error.response) {
          throw new Error(`Failed to get skills: ${error.response.data.message}`);
        }
        throw new Error(`Failed to get skills: ${error.message}`);
      }
    });

    it('should get a skill by ID', async () => {
      try {
        // First set up admin session to create a skill
        await api.auth.setSession({
          id: adminId.toString(),
          email: 'admin@example.com',
          role: 'admin',
          permissions: ['manage:skills']
        });

        // Create a test skill
        const skillData = generateTestSkillData();
        const createResponse = await api.skill.create(skillData);
        const skillId = createResponse.data.skill.id;

        // Clear session to test as public user
        await api.auth.clearSession();

        // Now try to get the skill by ID as a public user
        const response = await api.skill.getById(skillId);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('skill');
        expect(response.data.skill.id).toBe(skillId);
        expect(response.data.skill.name).toBe(skillData.name);

        // Clean up the test skill
        await api.auth.setSession({
          id: adminId.toString(),
          email: 'admin@example.com',
          role: 'admin',
          permissions: ['manage:skills']
        });
        await api.skill.delete(skillId);
      } catch (error) {
        if (error.response) {
          throw new Error(`Failed to get skill: ${error.response.data.message}`);
        }
        throw new Error(`Failed to get skill: ${error.message}`);
      }
    });
  });

  describe('Protected Endpoints (Admin Only)', () => {
    beforeEach(async () => {
      // Set up admin session
      await api.auth.setSession({
        id: adminId.toString(),
        email: 'admin@example.com',
        role: 'admin',
        permissions: ['manage:skills']
      });
    });

    it('should create a new skill', async () => {
      try {
        const skillData = generateTestSkillData();
        const response = await api.skill.create(skillData);
        expect(response.status).toBe(201);
        expect(response.data).toHaveProperty('message');
        expect(response.data).toHaveProperty('skill');
        expect(response.data.skill.name).toBe(skillData.name);
        testSkillId = response.data.skill.id;
      } catch (error) {
        if (error.response) {
          throw new Error(`Failed to create skill: ${error.response.data.message}`);
        }
        throw new Error(`Failed to create skill: ${error.message}`);
      }
    });

    it('should update an existing skill', async () => {
      try {
        // First create a skill to update
        const createResponse = await api.skill.create(generateTestSkillData());
        testSkillId = createResponse.data.skill.id;

        // Update the skill
        const updateData = {
          name: `Updated Skill ${Date.now()}`
        };

        const response = await api.skill.update(testSkillId, updateData);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('message');
        expect(response.data).toHaveProperty('skill');
        expect(response.data.skill.name).toBe(updateData.name);
      } catch (error) {
        if (error.response) {
          throw new Error(`Failed to update skill: ${error.response.data.message}`);
        }
        throw new Error(`Failed to update skill: ${error.message}`);
      }
    });

    it('should delete a skill', async () => {
      try {
        // First create a skill to delete
        const createResponse = await api.skill.create(generateTestSkillData());
        testSkillId = createResponse.data.skill.id;

        // Delete the skill
        const response = await api.skill.delete(testSkillId);
        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty('message');

        // Verify the skill is deleted
        try {
          await api.skill.getById(testSkillId);
          throw new Error('Skill still exists after deletion');
        } catch (error) {
          expect(error.response.status).toBe(404);
        }
      } catch (error) {
        if (error.response) {
          throw new Error(`Failed to delete skill: ${error.response.data.message}`);
        }
        throw new Error(`Failed to delete skill: ${error.message}`);
      }
    });
  });

  describe('Authorization Tests', () => {
    it('should not allow non-admin users to create skills', async () => {
      try {
        // Set up regular user session
        await api.auth.setSession({
          id: new mongoose.Types.ObjectId().toString(),
          email: 'user@example.com',
          role: 'user',
          permissions: []
        });

        const skillData = generateTestSkillData();
        await api.skill.create(skillData);
        throw new Error('Expected unauthorized error');
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });

    it('should not allow non-admin users to update skills', async () => {
      try {
        // Set up regular user session
        await api.auth.setSession({
          id: new mongoose.Types.ObjectId().toString(),
          email: 'user@example.com',
          role: 'user',
          permissions: []
        });

        // First get a valid skill ID
        const allSkillsResponse = await api.skill.getAll();
        const skillId = allSkillsResponse.data.skills[0]?.id;

        if (!skillId) {
          throw new Error('No skills found in the database');
        }

        const updateData = generateTestSkillData();
        await api.skill.update(skillId, updateData);
        throw new Error('Expected unauthorized error');
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });

    it('should not allow non-admin users to delete skills', async () => {
      try {
        // Set up regular user session
        await api.auth.setSession({
          id: new mongoose.Types.ObjectId().toString(),
          email: 'user@example.com',
          role: 'user',
          permissions: []
        });

        // First get a valid skill ID
        const allSkillsResponse = await api.skill.getAll();
        const skillId = allSkillsResponse.data.skills[0]?.id;

        if (!skillId) {
          throw new Error('No skills found in the database');
        }

        await api.skill.delete(skillId);
        throw new Error('Expected unauthorized error');
      } catch (error) {
        expect(error.response.status).toBe(403);
      }
    });
  });
}); 