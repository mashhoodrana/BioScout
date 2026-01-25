import axios from "axios";

// Base URL for API
const API_BASE_URL = "http://localhost:5001/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add JWT token to all requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("bioscout_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle 401 responses (token expired)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear localStorage and redirect to login
      localStorage.removeItem("bioscout_token");
      localStorage.removeItem("bioscout_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// ============ AUTHENTICATION API ============

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} name - User name
 * @param {string} password - User password
 * @param {string} confirmPassword - Confirm password
 * @returns {Promise} User data and JWT token
 */
export const registerUser = async (email, name, password, confirmPassword) => {
  try {
    const response = await apiClient.post("/auth/register", {
      email,
      name,
      password,
      confirm_password: confirmPassword,
    });
    return response.data;
  } catch (error) {
    console.error("Register error:", error);
    throw error.response?.data || error;
  }
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} User data and JWT token
 */
export const loginUser = async (email, password) => {
  try {
    const response = await apiClient.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error.response?.data || error;
  }
};

/**
 * Logout user
 * @returns {Promise} Logout response
 */
export const logoutUser = async () => {
  try {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  } catch (error) {
    console.error("Logout error:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get current user profile
 * @returns {Promise} User data
 */
export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get("/auth/me");
    return response.data;
  } catch (error) {
    console.error("Get current user error:", error);
    throw error.response?.data || error;
  }
};

// ============ CHAT HISTORY API ============

/**
 * Get all conversations for current user
 * @returns {Promise} Array of conversations
 */
export const getConversations = async () => {
  try {
    const response = await apiClient.get("/chats");
    return response.data;
  } catch (error) {
    console.error("Get conversations error:", error);
    throw error.response?.data || error;
  }
};

/**
 * Create a new conversation
 * @param {string} firstMessage - First message from user
 * @param {string} assistantResponse - Assistant response
 * @returns {Promise} Created conversation
 */
export const createConversation = async (firstMessage, assistantResponse) => {
  try {
    const response = await apiClient.post("/chats", {
      first_message: firstMessage,
      response: assistantResponse,
    });
    return response.data;
  } catch (error) {
    console.error("Create conversation error:", error);
    throw error.response?.data || error;
  }
};

/**
 * Get conversation by ID with all messages
 * @param {string} conversationId - Conversation ID
 * @returns {Promise} Conversation with messages
 */
export const getConversation = async (conversationId) => {
  try {
    const response = await apiClient.get(`/chats/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error("Get conversation error:", error);
    throw error.response?.data || error;
  }
};

/**
 * Add message to conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} userMessage - User message
 * @param {string} assistantResponse - Assistant response
 * @returns {Promise} Updated conversation
 */
export const addMessageToConversation = async (
  conversationId,
  userMessage,
  assistantResponse,
) => {
  try {
    const response = await apiClient.post(`/chats/${conversationId}/messages`, {
      message: userMessage,
      response: assistantResponse,
    });
    return response.data;
  } catch (error) {
    console.error("Add message error:", error);
    throw error.response?.data || error;
  }
};

/**
 * Delete conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise} Delete response
 */
export const deleteConversation = async (conversationId) => {
  try {
    const response = await apiClient.delete(`/chats/${conversationId}`);
    return response.data;
  } catch (error) {
    console.error("Delete conversation error:", error);
    throw error.response?.data || error;
  }
};

// ============ OBSERVATIONS API ============

/**
 * Fetch all observations or filter by parameters
 * @param {Object} filters - Optional filters (species, location, category)
 * @returns {Promise} Array of observations
 */
export const fetchObservations = async (filters = {}) => {
  try {
    const params = new URLSearchParams(filters).toString();
    const url = params ? `/observations/?${params}` : "/observations/";
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching observations:", error);
    throw error;
  }
};

/**
 * Create a new observation with image upload
 * @param {FormData} formData - Form data including image and observation details
 * @returns {Promise} Created observation object
 */
export const createObservation = async (formData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/observations/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error creating observation:", error);
    throw error;
  }
};

/**
 * Get a specific observation by ID
 * @param {string} id - Observation ID
 * @returns {Promise} Observation object
 */
export const fetchObservationById = async (id) => {
  try {
    const response = await apiClient.get(`/observations/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching observation ${id}:`, error);
    throw error;
  }
};

// ============ QUERIES API ============

/**
 * Submit a natural language query to the RAG system
 * @param {string} queryText - The question or query text
 * @returns {Promise} Query response with answer and observations
 */
export const submitQuery = async (queryText) => {
  try {
    const response = await apiClient.post("/queries", { query: queryText });
    return response.data;
  } catch (error) {
    console.error("Error submitting query:", error);
    throw error;
  }
};

// ============ USERS API ============

/**
 * Create a new user
 * @param {Object} userData - User information (name, email, etc.)
 * @returns {Promise} Created user object
 */
export const createUser = async (userData) => {
  try {
    const response = await apiClient.post("/users/", userData);
    return response.data;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/**
 * Fetch all users
 * @returns {Promise} Array of users
 */
export const fetchUsers = async () => {
  try {
    const response = await apiClient.get("/users/");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// ============ HEALTH CHECK ============

/**
 * Check API health status
 * @returns {Promise} Health status object
 */
export const checkHealth = async () => {
  try {
    const response = await axios.get("http://localhost:5001/health");
    return response.data;
  } catch (error) {
    console.error("Error checking health:", error);
    throw error;
  }
};

export default {
  fetchObservations,
  createObservation,
  fetchObservationById,
  submitQuery,
  createUser,
  fetchUsers,
  checkHealth,
};
