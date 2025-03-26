const logger = require('../utils/logger');

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateWalletAddress = (address) => {
  // Polkadot address validation
  // Format: 5 or more characters, starting with 1 or 5, containing only base58 characters
  const polkadotRegex = /^[15][1-9A-HJ-NP-Za-km-z]+$/;
  
  // Ethereum address validation
  // Format: 0x followed by 40 hexadecimal characters
  const ethereumRegex = /^0x[0-9a-fA-F]{40}$/;
  
  return polkadotRegex.test(address) || ethereumRegex.test(address);
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

  // Validate name if provided
  if (data.name) {
    if (typeof data.name !== 'string' || data.name.trim().length === 0) {
      errors.push('Skill name must be a non-empty string');
    } else if (data.name.length > 100) {
      errors.push('Skill name must be less than 100 characters');
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
    if (task.sponsorId && !validateWalletAddress(task.sponsorId)) {
      errors.push('Invalid sponsor wallet address format');
    }
    if (task.description && typeof task.description !== 'string') {
      errors.push('Task description must be a string');
    }
    if (task.deadline) {
      const date = new Date(task.deadline);
      if (isNaN(date)) {
        errors.push('Task deadline must be a valid date');
      }
    }
    if (task.postedTime) {
      const date = new Date(task.postedTime);
      if (isNaN(date)) {
        errors.push('Posted time must be a valid date');
      }
    }
    if (task.status && !['open', 'completed', 'cancelled'].includes(task.status)) {
      errors.push('Valid task status is required');
    }
    if (task.priority && !['low', 'medium', 'high', 'urgent'].includes(task.priority)) {
      errors.push('Valid task priority is required');
    }
    if (task.logo && typeof task.logo !== 'string') {
      errors.push('Task logo must be a string');
    }
    if (task.reward && typeof task.reward !== 'number') {
      errors.push('Reward value must be a number');
    }
    if (task.requirements && !Array.isArray(task.requirements)) {
      errors.push('Requirements must be an array');
    }
    if (task.deliverables && !Array.isArray(task.deliverables)) {
      errors.push('Deliverables must be an array');
    }
    if (task.category && !Array.isArray(task.category)) {
      errors.push('Category must be an array');
    }
    if (task.skills && !Array.isArray(task.skills)) {
      errors.push('Skills must be an array');
    }
    if (task.submissions && !Array.isArray(task.submissions)) {
      errors.push('Submissions must be an array');
    }
  } else {
    // For creation, validate all required fields
    if (!task.title) {
      errors.push('Task title is required');
    }
    if (!task.sponsorId || !validateWalletAddress(task.sponsorId)) {
      errors.push('Valid sponsor wallet address is required');
    }
    if (!task.description) {
      errors.push('Task description is required');
    }
    if (!task.deadline) {
      errors.push('Task deadline is required');
    } else {
      const date = new Date(task.deadline);
      if (isNaN(date)) {
        errors.push('Task deadline must be a valid date');
      }
    }
    if (!task.logo) {
      errors.push('Task logo is required');
    }
    if (typeof task.reward !== 'number') {
      errors.push('Reward value is required and must be a number');
    }
    if (!task.postedTime) {
      errors.push('Posted time is required');
    } else {
      const date = new Date(task.postedTime);
      if (isNaN(date)) {
        errors.push('Posted time must be a valid date');
      }
    }
    if (!task.status || !['open', 'completed', 'cancelled'].includes(task.status)) {
      errors.push('Valid task status is required');
    }
    // Validate arrays
    if (!Array.isArray(task.requirements)) {
      errors.push('Requirements must be an array');
    }
    if (!Array.isArray(task.deliverables)) {
      errors.push('Deliverables must be an array');
    } else if (task.deliverables.length === 0) {
      errors.push('Deliverables array cannot be empty');
    } else if (!task.deliverables.every(d => typeof d === 'string')) {
      errors.push('All deliverables must be strings');
    }
    if (!Array.isArray(task.category)) {
      errors.push('Category must be an array');
    }
    if (!Array.isArray(task.skills)) {
      errors.push('Skills must be an array');
    }
    if (!Array.isArray(task.submissions)) {
      errors.push('Submissions must be an array');
    }
  }

  return errors;
};

const validateSubmission = (submission) => {
  const errors = [];

  logger.info('Validating submission:', {
    submission,
    hasTaskId: !!submission.taskId,
    hasWalletAddress: !!submission.walletAddress,
    hasSubmissionTime: !!submission.submissionTime,
    hasStatus: !!submission.status,
    hasIsAccepted: submission.isAccepted !== undefined,
    isAcceptedType: typeof submission.isAccepted,
    isAcceptedValue: submission.isAccepted,
    rawSubmission: JSON.stringify(submission),
    keys: Object.keys(submission)
  });

  // Validate required fields
  if (!submission.taskId) {
    errors.push('Task ID is required');
  }
  if (!submission.walletAddress || !validateWalletAddress(submission.walletAddress)) {
    errors.push('Valid wallet address is required');
  }
  if (!submission.submissionTime) {
    errors.push('Submission time is required');
  } else {
    const date = new Date(submission.submissionTime);
    if (isNaN(date)) {
      errors.push('Submission time must be a valid date');
    }
  }
  if (!submission.status) {
    errors.push('Status is required');
  } else if (!['pending', 'accepted', 'rejected'].includes(submission.status)) {
    errors.push('Invalid status value');
  }
  // Only validate isAccepted if it's provided and not the default value
  if (submission.isAccepted !== undefined && typeof submission.isAccepted !== 'boolean') {
    errors.push('isAccepted must be a boolean');
  }

  // Validate optional fields
  if (submission.feedback && typeof submission.feedback !== 'string') {
    errors.push('Feedback must be a string');
  }
  if (submission.rating !== undefined && submission.rating !== null) {
    if (typeof submission.rating !== 'number' || submission.rating < 0 || submission.rating > 5) {
      errors.push('Rating must be a number between 0 and 5');
    }
  }
  if (submission.reviewTime) {
    const date = new Date(submission.reviewTime);
    if (isNaN(date)) {
      errors.push('Review time must be a valid date');
    }
  }
  if (submission.reviewerWalletAddress && !validateWalletAddress(submission.reviewerWalletAddress)) {
    errors.push('Invalid reviewer wallet address format');
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
  logger.info('Submission validation middleware - Request body:', {
    body: req.body,
    hasSubmission: !!req.body.submission,
    contentType: req.headers['content-type'],
    submissionData: req.body.submission,
    isAccepted: req.body.submission?.isAccepted,
    isAcceptedType: typeof req.body.submission?.isAccepted,
    isAcceptedValue: req.body.submission?.isAccepted,
    rawBody: JSON.stringify(req.body)
  });
  
  if (!req.body.submission) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: ['Submission data is required']
    });
  }
  
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