const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateWalletAddress = (wallet) => {
  // Basic Ethereum wallet address validation (0x followed by 40 hex characters)
  const walletRegex = /^0x[a-fA-F0-9]{40}$/;
  return walletRegex.test(wallet);
};

const validateSkill = (skill) => {
  const errors = [];

  // Validate name
  if (!skill.name || typeof skill.name !== 'string' || skill.name.trim().length === 0) {
    errors.push('Skill name is required and must be a non-empty string');
  } else if (skill.name.length > 100) {
    errors.push('Skill name must be less than 100 characters');
  }

  return errors;
};

const validateSkillUpdate = (data) => {
  const errors = [];

  // Validate id
  if (!data.id) {
    errors.push('Skill ID is required');
  }

  // Validate updated object
  if (!data.updated || typeof data.updated !== 'object') {
    errors.push('Updated data is required');
  } else {
    // Validate name in updated object
    if (!data.updated.name || typeof data.updated.name !== 'string' || data.updated.name.trim().length === 0) {
      errors.push('Updated skill name is required and must be a non-empty string');
    } else if (data.updated.name.length > 100) {
      errors.push('Updated skill name must be less than 100 characters');
    }
  }

  return errors;
};

const validateContributorProfile = (profile) => {
  const errors = [];

  // Validate basic info
  if (profile.basicInfo) {
    if (!profile.basicInfo.email || !validateEmail(profile.basicInfo.email)) {
      errors.push('Invalid email format');
    }
    if (!profile.basicInfo.displayName) {
      errors.push('Display name is required');
    }
  }

  // Validate skills
  if (profile.skills) {
    if (profile.skills.primarySkills) {
      profile.skills.primarySkills.forEach((skill, index) => {
        if (!skill.name) {
          errors.push(`Primary skill ${index + 1} must have a name`);
        }
        if (!['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.level)) {
          errors.push(`Invalid skill level for primary skill ${index + 1}`);
        }
      });
    }
  }

  return errors;
};

const validateSponsorProfile = (profile) => {
  const errors = [];

  // Validate required fields
  if (!profile.walletAddress || !validateWalletAddress(profile.walletAddress)) {
    errors.push('Invalid wallet address format');
  }
  if (!profile.name) {
    errors.push('Sponsor name is required');
  }
  if (!profile.logo) {
    errors.push('Sponsor logo is required');
  }
  if (!profile.description) {
    errors.push('Sponsor description is required');
  }

  // Validate optional fields if present
  if (profile.contactEmail && !validateEmail(profile.contactEmail)) {
    errors.push('Invalid contact email format');
  }

  return errors;
};

const validateTask = (task) => {
  const errors = [];

  // Validate required fields
  if (!task.title) {
    errors.push('Task title is required');
  }
  if (!task.sponsorId) {
    errors.push('Sponsor ID is required');
  }
  if (!task.logo) {
    errors.push('Task logo is required');
  }
  if (!task.description) {
    errors.push('Task description is required');
  }
  if (!task.deadline) {
    errors.push('Task deadline is required');
  }
  if (!task.reward) {
    errors.push('Task reward is required');
  }

  // Validate optional fields if present
  if (task.requirements && !Array.isArray(task.requirements)) {
    errors.push('Requirements must be an array');
  }
  if (task.category && !Array.isArray(task.category)) {
    errors.push('Category must be an array');
  }
  if (task.skills && !Array.isArray(task.skills)) {
    errors.push('Skills must be an array');
  }
  if (task.priority && !['low', 'medium', 'high', 'urgent'].includes(task.priority)) {
    errors.push('Invalid priority level');
  }

  return errors;
};

const validateSubmission = (submission) => {
  const errors = [];

  // Validate required fields
  if (!submission.taskId) {
    errors.push('Task ID is required');
  }
  if (!submission.contributorId) {
    errors.push('Contributor ID is required');
  }
  if (!submission.content) {
    errors.push('Submission content is required');
  }
  if (!submission.status || !['pending', 'approved', 'rejected'].includes(submission.status)) {
    errors.push('Valid submission status is required');
  }

  // Validate optional fields if present
  if (submission.feedback && typeof submission.feedback !== 'string') {
    errors.push('Feedback must be a string');
  }

  return errors;
};

const contributorValidation = (req, res, next) => {
  const errors = validateContributorProfile(req.body);
  
  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

const sponsorValidation = (req, res, next) => {
  const errors = validateSponsorProfile(req.body.profile || req.body.updated);
  
  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

const taskValidation = (req, res, next) => {
  const errors = validateTask(req.body.task);
  
  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

const skillValidation = (req, res, next) => {
  const errors = validateSkill(req.body);
  
  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

const skillUpdateValidation = (req, res, next) => {
  const errors = validateSkillUpdate(req.body);
  
  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

const submissionValidation = (req, res, next) => {
  const errors = validateSubmission(req.body.submission);
  
  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

module.exports = {
  contributorValidation,
  sponsorValidation,
  taskValidation,
  skillValidation,
  skillUpdateValidation,
  submissionValidation,
  validateEmail,
  validateWalletAddress
}; 