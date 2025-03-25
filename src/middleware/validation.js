const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateWalletAddress = (wallet) => {
  // Polkadot address validation
  // - Starts with 1 or 5
  // - Contains only base58 characters
  // - Length between 47-48 characters
  const walletRegex = /^[15][1-9A-HJ-NP-Za-km-z]{46,47}$/;
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

const validateContributorProfile = (profile, isUpdate = false) => {
  const errors = [];

  // Validate basic info
  if (!profile.basicInfo) {
    errors.push('Basic info is required');
  } else {
    // For registration, email, displayName, and walletAddress are required
    if (!isUpdate) {
      if (!profile.basicInfo.email || !validateEmail(profile.basicInfo.email)) {
        errors.push('Invalid email format');
      }
      if (!profile.basicInfo.displayName) {
        errors.push('Display name is required');
      }
      if (!profile.basicInfo.walletAddress || !validateWalletAddress(profile.basicInfo.walletAddress)) {
        errors.push('Invalid wallet address format');
      }
    } else {
      // For updates, validate fields only if provided
      if (profile.basicInfo.email && !validateEmail(profile.basicInfo.email)) {
        errors.push('Invalid email format');
      }
      if (profile.basicInfo.walletAddress && !validateWalletAddress(profile.basicInfo.walletAddress)) {
        errors.push('Invalid wallet address format');
      }
    }

    // Validate optional fields if present
    if (profile.basicInfo.website && typeof profile.basicInfo.website !== 'string') {
      errors.push('Website must be a string');
    }
    if (profile.basicInfo.x && typeof profile.basicInfo.x !== 'string') {
      errors.push('X (Twitter) must be a string');
    }
    if (profile.basicInfo.discord && typeof profile.basicInfo.discord !== 'string') {
      errors.push('Discord must be a string');
    }
    if (profile.basicInfo.telegram && typeof profile.basicInfo.telegram !== 'string') {
      errors.push('Telegram must be a string');
    }
  }

  // Validate skills if present
  if (profile.skills) {
    if (profile.skills.primarySkills) {
      if (!Array.isArray(profile.skills.primarySkills)) {
        errors.push('Primary skills must be an array');
      } else {
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
    if (profile.skills.secondarySkills) {
      if (!Array.isArray(profile.skills.secondarySkills)) {
        errors.push('Secondary skills must be an array');
      } else {
        profile.skills.secondarySkills.forEach((skill, index) => {
          if (!skill.name) {
            errors.push(`Secondary skill ${index + 1} must have a name`);
          }
          if (!['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.level)) {
            errors.push(`Invalid skill level for secondary skill ${index + 1}`);
          }
        });
      }
    }
  }

  return errors;
};

const validateSponsorProfile = (profile, isUpdate = false) => {
  const errors = [];

  // For registration, validate required fields
  if (!isUpdate) {
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
  } else {
    // For updates, only validate fields that are present
    if (profile.walletAddress && !validateWalletAddress(profile.walletAddress)) {
      errors.push('Invalid wallet address format');
    }
  }

  // Validate optional fields if present
  if (profile.contactEmail && !validateEmail(profile.contactEmail)) {
    errors.push('Invalid contact email format');
  }

  return errors;
};

const validateTask = (task, isUpdate = false) => {
  const errors = [];

  // For updates, only validate fields that are present
  if (isUpdate) {
    if (task.title && typeof task.title !== 'string') {
      errors.push('Task title must be a string');
    }
    if (task.sponsorId && typeof task.sponsorId !== 'string') {
      errors.push('Sponsor ID must be a string');
    }
    if (task.description && typeof task.description !== 'string') {
      errors.push('Task description must be a string');
    }
    if (task.deadline && typeof task.deadline !== 'string') {
      errors.push('Task deadline must be a string');
    }
    if (task.postedTime && typeof task.postedTime !== 'string') {
      errors.push('Posted time must be a string');
    }
    if (task.status && !['open', 'completed', 'cancelled'].includes(task.status)) {
      errors.push('Valid task status is required');
    }
    if (task.logo && typeof task.logo !== 'string') {
      errors.push('Task logo must be a string');
    }
    if (task.reward && typeof task.reward !== 'number') {
      errors.push('Reward value must be a number');
    }
    if (task.maxAccepted && typeof task.maxAccepted !== 'number') {
      errors.push('Max accepted value must be a number');
    }
  } else {
    // For creation, validate all required fields
    if (!task.title) {
      errors.push('Task title is required');
    }
    if (!task.sponsorId) {
      errors.push('Sponsor ID is required');
    }
    if (!task.description) {
      errors.push('Task description is required');
    }
    if (!task.deadline) {
      errors.push('Task deadline is required');
    }
    if (!task.postedTime) {
      errors.push('Posted time is required');
    }
    if (!task.status || !['open', 'completed', 'cancelled'].includes(task.status)) {
      errors.push('Valid task status is required');
    }
    if (!task.logo) {
      errors.push('Task logo is required');
    }
    if (!task.reward || typeof task.reward !== 'number') {
      errors.push('Reward value is required and must be a number');
    }
    if (!task.maxAccepted || typeof task.maxAccepted !== 'number') {
      errors.push('Max accepted value is required and must be a number');
    }
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
  if (task.submissions && !Array.isArray(task.submissions)) {
    errors.push('Submissions must be an array');
  }

  return errors;
};

const validateSubmission = (submission) => {
  const errors = [];

  // Validate required fields
  if (!submission.taskId) {
    errors.push('Task ID is required');
  }
  if (!submission.walletAddress || !validateWalletAddress(submission.walletAddress)) {
    errors.push('Valid wallet address is required');
  }
  if (!Array.isArray(submission.submissions)) {
    errors.push('Submissions must be an array of strings');
  } else {
    submission.submissions.forEach((sub, index) => {
      if (typeof sub !== 'string') {
        errors.push(`Submission at index ${index} must be a string`);
      }
    });
  }

  // Validate optional fields if present
  if (submission.grading !== undefined && submission.grading !== null) {
    if (!Number.isInteger(submission.grading) || submission.grading < 0 || submission.grading > 10) {
      errors.push('Grading must be an integer between 0 and 10');
    }
  }
  if (submission.isAccepted !== undefined && typeof submission.isAccepted !== 'boolean') {
    errors.push('isAccepted must be a boolean value');
  }

  return errors;
};

const contributorValidation = (req, res, next) => {
  let data = req.body;
  let isUpdate = false;
  
  // Handle update case where data is nested under 'updated'
  if (data.updated) {
    // For updates, we need to validate both the email in the root and the updated data
    if (!data.email || !validateEmail(data.email)) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: ['Invalid email format']
      });
    }
    data = data.updated;
    isUpdate = true;
  } else if (data.profile) {
    // Handle registration case where data is nested under 'profile'
    data = data.profile;
  } else if (data.walletAddress) {
    // Handle login case
    if (!validateWalletAddress(data.walletAddress)) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: ['Invalid wallet address format']
      });
    }
    return next();
  }
  
  const errors = validateContributorProfile(data, isUpdate);
  
  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

const sponsorValidation = (req, res, next) => {
  let data = req.body;
  let isUpdate = false;
  
  // Handle update case where data is nested under 'updated'
  if (data.updated) {
    data = data.updated;
    isUpdate = true;
  } else if (data.profile) {
    data = data.profile;
  } else if (data.wallet) {
    // Handle login case
    if (!validateWalletAddress(data.wallet)) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: ['Invalid wallet address format']
      });
    }
    return next();
  }
  
  const errors = validateSponsorProfile(data, isUpdate);
  
  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }
  
  next();
};

const taskValidation = (req, res, next) => {
  const isUpdate = req.path === '/update';
  const errors = validateTask(req.body.task, isUpdate);
  
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