import { z } from 'zod';

const envSchema = z.object({
  VITE_YOUTRACK_URL: z.string(), // Allow empty string for proxy mode
  VITE_YOUTRACK_TOKEN: z.string().min(1),
  VITE_YOUTRACK_PROJECT_ID: z.string().min(1),
});

// Validate environment variables on app load (relaxed validation for demo mode)
const envInput = {
  VITE_YOUTRACK_URL: import.meta.env.VITE_YOUTRACK_URL || '',
  VITE_YOUTRACK_TOKEN: import.meta.env.VITE_YOUTRACK_TOKEN || 'perm:your-token-here',
  VITE_YOUTRACK_PROJECT_ID: import.meta.env.VITE_YOUTRACK_PROJECT_ID || 'YOUR-PROJECT',
};

const env = envSchema.parse(envInput);

export default env;
