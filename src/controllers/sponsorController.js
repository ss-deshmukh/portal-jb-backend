const Sponsor = require('../models/Sponsor');
const { validateWalletAddress } = require('../middleware/validation');

// Register a new sponsor
exports.register = async (req, res) => {
  try {
    const { profile } = req.body;

    // Validate wallet address
    if (!profile.walletAddress || !validateWalletAddress(profile.walletAddress)) {
      return res.status(400).json({
        message: 'Invalid wallet address format'
      });
    }

    // Check if sponsor already exists
    const existingSponsor = await Sponsor.findOne({ walletAddress: profile.walletAddress });
    if (existingSponsor) {
      return res.status(400).json({
        message: 'Sponsor already exists'
      });
    }

    // Create new sponsor
    const sponsor = new Sponsor({
      ...profile,
      registeredAt: new Date()
    });

    await sponsor.save();

    res.status(201).json({
      message: 'Sponsor registered successfully',
      sponsor
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Error registering sponsor',
      error: error.message
    });
  }
};

// Login sponsor
exports.login = async (req, res) => {
  try {
    const { wallet } = req.body;

    // Validate wallet address
    if (!wallet || !validateWalletAddress(wallet)) {
      return res.status(400).json({
        message: 'Invalid wallet address format'
      });
    }

    // Find sponsor
    const sponsor = await Sponsor.findOne({ walletAddress: wallet });
    if (!sponsor) {
      return res.status(404).json({
        message: 'Sponsor not found'
      });
    }

    // TODO: Implement proper authentication (JWT, session, etc.)
    res.json({
      message: 'Login successful',
      sponsor
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Error logging in',
      error: error.message
    });
  }
};

// Update sponsor profile
exports.updateProfile = async (req, res) => {
  try {
    const { wallet, updated } = req.body;

    // Validate wallet address
    if (!wallet || !validateWalletAddress(wallet)) {
      return res.status(400).json({
        message: 'Invalid wallet address format'
      });
    }

    // Find sponsor
    const sponsor = await Sponsor.findOne({ walletAddress: wallet });
    if (!sponsor) {
      return res.status(404).json({
        message: 'Sponsor not found'
      });
    }

    // Update fields
    Object.keys(updated).forEach(key => {
      if (key !== 'walletAddress' && key !== 'registeredAt') {
        sponsor[key] = updated[key];
      }
    });

    await sponsor.save();

    res.json({
      message: 'Profile updated successfully',
      sponsor
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// Delete sponsor
exports.deleteProfile = async (req, res) => {
  try {
    const { wallet } = req.body;

    // Validate wallet address
    if (!wallet || !validateWalletAddress(wallet)) {
      return res.status(400).json({
        message: 'Invalid wallet address format'
      });
    }

    // Find and delete sponsor
    const sponsor = await Sponsor.findOneAndDelete({ walletAddress: wallet });
    if (!sponsor) {
      return res.status(404).json({
        message: 'Sponsor not found'
      });
    }

    res.json({
      message: 'Sponsor deleted successfully'
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      message: 'Error deleting sponsor',
      error: error.message
    });
  }
}; 