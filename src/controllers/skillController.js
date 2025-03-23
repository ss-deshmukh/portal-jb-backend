const Skill = require('../models/Skill');
const crypto = require('crypto');

// Generate a random skill ID
const generateSkillId = () => {
  return crypto.randomBytes(16).toString('hex');
};

// Create a new skill
exports.createSkill = async (req, res) => {
  try {
    const { name } = req.body;

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

    res.status(201).json({
      message: 'Skill created successfully',
      skill
    });
  } catch (error) {
    console.error('Skill creation error:', error);
    res.status(500).json({
      message: 'Error creating skill',
      error: error.message
    });
  }
};

// Update a skill
exports.updateSkill = async (req, res) => {
  try {
    const { id, updated } = req.body;

    // Find skill
    const skill = await Skill.findOne({ id });
    if (!skill) {
      return res.status(404).json({
        message: 'Skill not found'
      });
    }

    // Check if new name already exists
    if (updated.name && updated.name !== skill.name) {
      const existingSkill = await Skill.findOne({ name: updated.name.trim() });
      if (existingSkill) {
        return res.status(400).json({
          message: 'Skill name already exists'
        });
      }
    }

    // Update skill
    skill.name = updated.name.trim();
    await skill.save();

    res.json({
      message: 'Skill updated successfully',
      skill
    });
  } catch (error) {
    console.error('Skill update error:', error);
    res.status(500).json({
      message: 'Error updating skill',
      error: error.message
    });
  }
};

// Delete a skill
exports.deleteSkill = async (req, res) => {
  try {
    const { id } = req.body;

    // Find and delete skill
    const skill = await Skill.findOneAndDelete({ id });
    if (!skill) {
      return res.status(404).json({
        message: 'Skill not found'
      });
    }

    res.json({
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    console.error('Skill deletion error:', error);
    res.status(500).json({
      message: 'Error deleting skill',
      error: error.message
    });
  }
}; 