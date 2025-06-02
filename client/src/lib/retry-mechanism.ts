interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

const defaultOptions: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2
};

export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...defaultOptions, ...options };
  let lastError: Error;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on certain errors
      if (isNonRetryableError(error)) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === config.maxRetries) {
        break;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffFactor, attempt),
        config.maxDelay
      );
      
      console.warn(`Operation failed (attempt ${attempt + 1}), retrying in ${delay}ms:`, error);
      await sleep(delay);
    }
  }
  
  throw lastError!;
}

function isNonRetryableError(error: any): boolean {
  // Don't retry authentication errors, validation errors, etc.
  if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
    return true;
  }
  if (error.message?.includes('400') || error.message?.includes('Bad Request')) {
    return true;
  }
  if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
    return true;
  }
  if (error.message?.includes('404') || error.message?.includes('Not Found')) {
    return true;
  }
  return false;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Enhanced API request with automatic retry
export async function apiRequestWithRetry(
  method: string,
  url: string,
  data?: any,
  options: Partial<RetryOptions> = {}
): Promise<Response> {
  return withRetry(async () => {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`${response.status}: ${response.statusText}`);
    }
    
    return response;
  }, options);
}