export const APPLICATION_STATUS_LABELS: Record<string, string> = {
  SUBMITTED: 'Submitted',
  UNDER_REVIEW: 'Under Review',
  SCREENING_REQUESTED: 'Screening Requested',
  SCREENING_COMPLETED: 'Screening Completed',
  SHORTLISTED: 'Shortlisted',
  INTERVIEW_SCHEDULED: 'Interview Scheduled',
  OFFERED: 'Offered',
  ACCEPTED: 'Accepted',
  DECLINED_BY_STUDENT: 'Declined',
  REJECTED: 'Rejected',
  WITHDRAWN: 'Withdrawn',
};

export const APPLICATION_STATUS_COLORS: Record<string, string> = {
  SUBMITTED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  SCREENING_REQUESTED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  SCREENING_COMPLETED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  SHORTLISTED: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  INTERVIEW_SCHEDULED: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  OFFERED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  ACCEPTED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  DECLINED_BY_STUDENT: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  WITHDRAWN: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-500',
};

export const JOB_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  ACTIVE: 'Active',
  PAUSED: 'Paused',
  CLOSED: 'Closed',
  FILLED: 'Filled',
};

export const JOB_STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  PAUSED: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  CLOSED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  FILLED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

export const JOB_TYPE_LABELS: Record<string, string> = {
  INTERNSHIP: 'Internship',
  PLACEMENT: 'Placement',
  FULL_TIME: 'Full Time',
  CONTRACT: 'Contract',
};

export const EMPLOYER_VERIFICATION_LABELS: Record<string, string> = {
  PENDING: 'Pending Verification',
  APPROVED: 'Verified',
  REJECTED: 'Rejected',
};

export const EMPLOYER_VERIFICATION_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  APPROVED: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  REJECTED: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const COMPANY_SIZE_LABELS: Record<string, string> = {
  SMALL: '1-50 employees',
  MEDIUM: '51-200 employees',
  LARGE: '201-1000 employees',
  ENTERPRISE: '1000+ employees',
};

export const PLACEMENT_STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Active',
  COMPLETED: 'Completed',
  TERMINATED: 'Terminated',
};

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ['UNDER_REVIEW', 'REJECTED', 'WITHDRAWN'],
  UNDER_REVIEW: ['SCREENING_REQUESTED', 'SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SCREENING_REQUESTED: ['SCREENING_COMPLETED', 'WITHDRAWN'],
  SCREENING_COMPLETED: ['SHORTLISTED', 'REJECTED', 'WITHDRAWN'],
  SHORTLISTED: ['INTERVIEW_SCHEDULED', 'OFFERED', 'REJECTED', 'WITHDRAWN'],
  INTERVIEW_SCHEDULED: ['OFFERED', 'REJECTED', 'WITHDRAWN'],
  OFFERED: ['ACCEPTED', 'DECLINED_BY_STUDENT', 'WITHDRAWN'],
  ACCEPTED: [],
  DECLINED_BY_STUDENT: [],
  REJECTED: [],
  WITHDRAWN: [],
};
