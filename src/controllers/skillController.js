const Skill = require('../models/Skill');
const crypto = require('crypto');
const logger = require('../utils/logger');

// Generate a random skill ID
const generateSkillId = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Get all skills
exports.getAllSkills = async (req, res) => {
  try {
    // Log the get request
    logger.info('Getting all skills');

    // Find all skills
    const skills = await Skill.find();

    logger.info('Skills retrieved successfully');

    res.json({
      message: 'Skills retrieved successfully',
      skills
    });
  } catch (error) {
    logger.error('Skills retrieval error:', error);
    res.status(500).json({
      message: 'Error retrieving skills',
      error: error.message
    });
  }
};

// Create a new skill
exports.createSkill = async (req, res) => {
  try {
    const { name } = req.body;

    // Log the incoming request data
    logger.info('Creating skill with data:', req.body);

    // Check if skill already exists
    const existingSkill = await Skill.findOne({ name: name.trim() });
    if (existingSkill) {
      return res.status(400).json({
        message: 'Skill already exists'
      });
    }

    // Generate skill ID
    const skillId = generateSkillId();

    // Create new skill
    const skill = new Skill({
      id: skillId,
      name: name.trim()
    });

    await skill.save();

    logger.info('Skill created successfully:', skillId);

    res.status(201).json({
      message: 'Skill created successfully',
      skill
    });
  } catch (error) {
    logger.error('Skill creation error:', error);
    res.status(500).json({
      message: 'Error creating skill',
      error: error.message
    });
  }
};

// Get a skill by ID
exports.getSkill = async (req, res) => {
  try {
    const { id } = req.params;

    // Log the get request
    logger.info('Getting skill:', { id });

    // Find skill
    const skill = await Skill.findOne({ id });
    if (!skill) {
      return res.status(404).json({
        message: 'Skill not found'
      });
    }

    logger.info('Skill retrieved successfully:', id);

    res.json({
      message: 'Skill retrieved successfully',
      skill
    });
  } catch (error) {
    logger.error('Skill retrieval error:', error);
    res.status(500).json({
      message: 'Error retrieving skill',
      error: error.message
    });
  }
};

// Update a skill
exports.updateSkill = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Log the update request
    logger.info('Updating skill:', { id, ...req.body });

    // Find skill
    const skill = await Skill.findOne({ id });
    if (!skill) {
      return res.status(404).json({
        message: 'Skill not found'
      });
    }

    // Check if new name already exists
    if (name && name !== skill.name) {
      const existingSkill = await Skill.findOne({ name: name.trim() });
      if (existingSkill) {
        return res.status(400).json({
          message: 'Skill name already exists'
        });
      }
    }

    // Update skill
    if (name) skill.name = name.trim();
    await skill.save();

    logger.info('Skill updated successfully:', id);

    res.json({
      message: 'Skill updated successfully',
      skill
    });
  } catch (error) {
    logger.error('Skill update error:', error);
    res.status(500).json({
      message: 'Error updating skill',
      error: error.message
    });
  }
};

// Delete a skill
exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.params;

    // Log the deletion request
    logger.info('Deleting skill:', { id });

    // Find and delete skill
    const skill = await Skill.findOneAndDelete({ id });
    if (!skill) {
      return res.status(404).json({
        message: 'Skill not found'
      });
    }

    logger.info('Skill deleted successfully:', id);

    res.json({
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    logger.error('Skill deletion error:', error);
    res.status(500).json({
      message: 'Error deleting skill',
      error: error.message
    });
  }
}; 