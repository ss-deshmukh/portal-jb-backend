const Contributor = require('../models/Contributor');
const { validateEmail } = require('../middleware/validation');

// Register a new contributor
exports.register = async (req, res) => {
  try {
    const { basicInfo } = req.body;

    // Validate email
    if (!basicInfo?.email || !validateEmail(basicInfo.email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }

    // Check if contributor already exists
    const existingContributor = await Contributor.findOne({ 'basicInfo.email': basicInfo.email });
    if (existingContributor) {
      return res.status(400).json({
        message: 'Contributor already exists'
      });
    }

    // Create new contributor
    const contributor = new Contributor({
      basicInfo: {
        ...basicInfo,
        joinDate: new Date()
      }
    });

    await contributor.save();

    res.status(201).json({
      message: 'Contributor registered successfully',
      contributor
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Error registering contributor',
      error: error.message
    });
  }
};

// Login contributor
exports.login = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }

    // Find contributor
    const contributor = await Contributor.findOne({ 'basicInfo.email': email });
    if (!contributor) {
      return res.status(404).json({
        message: 'Contributor not found'
      });
    }

    // TODO: Implement proper authentication (JWT, session, etc.)
    res.json({
      message: 'Login successful',
      contributor
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error logging in',
      error: error.message
    });
  }
};

// Update contributor profile
exports.updateProfile = async (req, res) => {
  try {
    const { email, updated } = req.body;

    // Validate email
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }

    // Find contributor
    const contributor = await Contributor.findOne({ 'basicInfo.email': email });
    if (!contributor) {
      return res.status(404).json({
        message: 'Contributor not found'
      });
    }

    // Update fields
    if (updated.basicInfo) {
      contributor.basicInfo = { ...contributor.basicInfo, ...updated.basicInfo };
    }
    if (updated.contactPreferences) {
      contributor.contactPreferences = { ...contributor.contactPreferences, ...updated.contactPreferences };
    }
    if (updated.preferences) {
      contributor.preferences = { ...contributor.preferences, ...updated.preferences };
    }
    if (updated.skills) {
      contributor.skills = { ...contributor.skills, ...updated.skills };
    }

    await contributor.save();

    res.json({
      message: 'Profile updated successfully',
      contributor
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Delete contributor
exports.deleteProfile = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        message: 'Invalid email format'
      });
    }

    // Find and delete contributor
    const contributor = await Contributor.findOneAndDelete({ 'basicInfo.email': email });
    if (!contributor) {
      return res.status(404).json({
        message: 'Contributor not found'
      });
    }

    res.json({
      message: 'Contributor deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      message: 'Error deleting contributor',
      error: error.message
    });
  }
}; 