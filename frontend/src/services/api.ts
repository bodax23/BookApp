import axios from "axios";

// OpenLibrary API URL
const OPENLIBRARY_URL = "https://openlibrary.org";

// Backend URL
const BACKEND_URL = "http://localhost:8000";

// Create axios instances with default configurations
const backendApi = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const openLibraryApi = axios.create({
  baseURL: OPENLIBRARY_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include token in requests and log requests
backendApi.interceptors.request.use(
  (config) => {
    console.log("Backend API Request:", {
      url: config.url,
      method: config.method,
      params: config.params,
      data: config.data,
    });

    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors and log responses
backendApi.interceptors.response.use(
  (response) => {
    console.log("Backend API Response:", {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    console.error("Response error:", error.response || error);

    if (error.response && error.response.status === 401) {
      // Unauthorized - token expired or invalid
      localStorage.removeItem("token");
      // Only redirect if not already on /login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Types
interface BookSearchParams {
  query: string;
  searchType: "title" | "author" | "isbn";
  page?: number;
  limit?: number;
}

interface BookItem {
  id: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  key?: string;
}

interface BookDetail {
  id: string;
  title: string;
  authors?: { name: string }[];
  description?: string;
  publish_date?: string;
  cover_i?: number;
  isbn_13?: string[];
  subjects?: string[];
  created?: string;
  last_modified?: string;
  isbn_10?: string[];
}

interface ReadingListItem {
  id: number;
  book_id: string;
  title: string;
  author: string;
  cover_id?: number;
  year?: number;
  added_at: string;
}

// Authentication API
export const authApi = {
  register: async (userData: {
    username: string;
    email: string;
    password: string;
  }) => {
    console.log("Registering user with data:", userData);

    try {
      // Format the data according to the backend requirements
      const formattedData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        // Add any other required fields based on backend validation
        is_active: true,
      };

      const response = await backendApi.post(
        "/api/auth/register",
        formattedData
      );
      console.log("Registration successful:", response.data);

      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);

        // After successful registration, fetch user data from API
        try {
          const userResponse = await backendApi.get("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${response.data.access_token}`,
            },
          });

          if (userResponse.data) {
            localStorage.setItem("user", JSON.stringify(userResponse.data));
            response.data.user = userResponse.data;
          }
        } catch (userError) {
          console.error(
            "Error fetching user data after registration:",
            userError
          );
          // Don't add placeholder user, let the calling code handle the error
        }
      }

      return response.data;
    } catch (error: any) {
      console.error("Registration error:", error);

      // Handle specific error codes
      if (error.response && error.response.status === 422) {
        const validationErrors = error.response.data?.detail || [];
        const errorMessages = validationErrors
          .map((err: any) => `${err.loc.join(".")} - ${err.msg}`)
          .join("\n");

        throw new Error(
          `Validation error: ${errorMessages || "Please check your input"}`
        );
      }

      throw error;
    }
  },

  login: async (credentials: { email: string; password: string }) => {
    try {
      console.log("Login with credentials:", {
        email: credentials.email,
        password: "***",
      });

      // Determine if the input is an email or username
      const isEmail = credentials.email.includes("@");

      // Use x-www-form-urlencoded format for FastAPI OAuth compatibility
      const formData = new URLSearchParams();

      // The backend expects 'username' field, but our frontend uses 'email'
      // We need to check if the input is an email or username
      if (isEmail) {
        // For email login, use the email as the username
        formData.append("username", credentials.email);
      } else {
        // If it's not an email format, assume it's a username
        formData.append("username", credentials.email);
      }

      formData.append("password", credentials.password);

      console.log("Sending login request with formData:", {
        username: formData.get("username"),
        password: "***",
      });

      const response = await backendApi.post("/api/auth/login", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      console.log("Login response data:", response.data);

      if (response.data.access_token) {
        localStorage.setItem("token", response.data.access_token);

        // After successful login, fetch user data from API
        try {
          const userResponse = await backendApi.get("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${response.data.access_token}`,
            },
          });

          if (userResponse.data) {
            localStorage.setItem("user", JSON.stringify(userResponse.data));
            response.data.user = userResponse.data;
          }
        } catch (userError) {
          console.error("Error fetching user data after login:", userError);
          // Don't add placeholder user, let the calling code handle the error
        }
      }

      return response.data;
    } catch (error: any) {
      console.error("Login error:", error);

      // Handle specific error codes
      if (error.response && error.response.status === 422) {
        throw new Error(
          "Invalid credentials format. Please check your email and password."
        );
      } else if (error.response && error.response.status === 401) {
        throw new Error("Invalid email or password.");
      }

      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear any other auth-related data from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (
        key &&
        (key.startsWith("auth_") ||
          key.includes("token") ||
          key.includes("user"))
      ) {
        keysToRemove.push(key);
      }
    }

    // Remove the collected keys
    keysToRemove.forEach((key) => localStorage.removeItem(key));

    console.log("User logged out, auth data cleared");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

// Direct OpenLibrary API
export const openLibraryDirectApi = {
  searchBooks: async (
    query: string,
    type: string = "title",
    page: number = 1,
    limit: number = 10
  ): Promise<{ docs: BookItem[]; numFound: number }> => {
    try {
      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Set the search field based on type
      let searchField = "title";
      if (type === "author") {
        searchField = "author";
      } else if (type === "isbn") {
        searchField = "isbn";
      }

      // Make direct API call to OpenLibrary search
      const response = await axios.get(`https://openlibrary.org/search.json`, {
        params: {
          q: query,
          [searchField]: query, // Use the appropriate field
          limit,
          offset,
          page,
        },
      });

      // Process the response to match our expected format
      const books = response.data.docs.map((book: any) => ({
        key: book.key || `/works/${book.key}`,
        id: book.key || book.cover_edition_key,
        title: book.title,
        author_name: book.author_name,
        first_publish_year: book.first_publish_year,
        cover_i: book.cover_i,
        isbn: book.isbn,
      }));

      return {
        docs: books,
        numFound: response.data.numFound,
      };
    } catch (error) {
      console.error("OpenLibrary search error:", error);
      throw error;
    }
  },

  getBookDetails: async (bookId: string): Promise<BookDetail> => {
    try {
      console.log("OpenLibrary API - Getting book details for:", bookId);

      // Normalize the bookId to work with OpenLibrary API
      let normalizedBookId = bookId;
      if (!normalizedBookId.startsWith("/works/")) {
        normalizedBookId = `/works/${normalizedBookId}`;
      }

      console.log("Normalized book ID:", normalizedBookId);

      // Check if the ID seems malformed and adjust if necessary
      // Sometimes IDs come in different formats and need additional normalization
      if (normalizedBookId.includes("/works//")) {
        normalizedBookId = normalizedBookId.replace("/works//", "/works/");
        console.log("Fixed double slash in book ID:", normalizedBookId);
      }

      // Remove any trailing characters that shouldn't be in the ID
      normalizedBookId = normalizedBookId.replace(/[?&=#]/g, "");

      // Make direct API call to OpenLibrary for book details
      console.log(
        "Requesting book data from:",
        `https://openlibrary.org${normalizedBookId}.json`
      );
      const response = await axios.get(
        `https://openlibrary.org${normalizedBookId}.json`,
        {
          timeout: 8000, // 8 second timeout
        }
      );

      console.log("OpenLibrary response received:", response.status);

      // For debugging
      if (!response.data) {
        console.warn("OpenLibrary returned empty data for:", normalizedBookId);
        throw new Error("No data returned from OpenLibrary");
      }

      if (!response.data.title) {
        console.warn(
          "OpenLibrary returned data without a title:",
          response.data
        );
      }

      // Get author data in a separate request if available
      let authors: { name: string }[] = [];
      if (response.data.authors) {
        console.log("Book has authors, fetching details...");

        try {
          authors = await Promise.all(
            response.data.authors.map(async (author: any, index: number) => {
              try {
                // Author data can be in different formats
                const authorKey =
                  typeof author === "object"
                    ? author.author?.key || author.key
                    : author;

                if (!authorKey) {
                  console.warn(`Author at index ${index} has no key:`, author);
                  return { name: "Unknown Author" };
                }

                // Make sure the key starts with /
                const formattedKey = authorKey.startsWith("/")
                  ? authorKey
                  : `/${authorKey}`;

                console.log(`Fetching author data for: ${formattedKey}`);
                const authorResponse = await axios.get(
                  `https://openlibrary.org${formattedKey}.json`,
                  {
                    timeout: 5000, // 5 second timeout for author data
                  }
                );

                if (authorResponse.data && authorResponse.data.name) {
                  return { name: authorResponse.data.name };
                }
                return { name: "Unknown Author" };
              } catch (error) {
                console.error("Error fetching individual author:", error);
                return { name: "Unknown Author" };
              }
            })
          );
        } catch (authorError) {
          console.error("Error in author data processing:", authorError);
          // Continue with empty authors rather than failing completely
        }
      }

      // Extract and format the description
      let description = "";
      if (response.data.description) {
        description =
          typeof response.data.description === "object"
            ? response.data.description.value
            : response.data.description;
      }

      // Create a standardized book detail object
      const bookDetail: BookDetail = {
        id: normalizedBookId.replace("/works/", ""),
        title: response.data.title || "Unknown Title",
        authors: authors.length > 0 ? authors : undefined,
        description: description,
        subjects: response.data.subjects || [],
        cover_i:
          response.data.covers && response.data.covers.length > 0
            ? response.data.covers[0]
            : undefined,
        publish_date: response.data.first_publish_date,
        created: response.data.created?.value,
        last_modified: response.data.last_modified?.value,
      };

      console.log("Returning formatted book detail:", bookDetail);
      return bookDetail;
    } catch (error) {
      console.error("OpenLibrary book details error:", error);

      // Try to provide a meaningful error message based on the error type
      if (axios.isAxiosError(error)) {
        if (error.code === "ECONNABORTED") {
          throw new Error(
            "Request timed out. The server is taking too long to respond."
          );
        }

        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          if (error.response.status === 404) {
            throw new Error(`Book with ID ${bookId} not found.`);
          }
          throw new Error(
            `Server error: ${error.response.status} - ${error.response.statusText}`
          );
        } else if (error.request) {
          // The request was made but no response was received
          throw new Error(
            "No response received from server. Please check your connection and try again."
          );
        }
      }

      // Generic error fallback
      throw new Error(
        `Failed to load book details: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  },
};

// Books API (Updated to use direct OpenLibrary API with fallback to backend)
export const booksApi = {
  searchBooks: async (
    query: string,
    type: string = "title",
    page: number = 1,
    limit: number = 10
  ) => {
    try {
      // First try the direct OpenLibrary API
      return await openLibraryDirectApi.searchBooks(query, type, page, limit);
    } catch (error) {
      console.warn(
        "Direct OpenLibrary search failed, falling back to backend:",
        error
      );

      // Fallback to backend
      try {
        const response = await backendApi.get("/api/books/search", {
          params: { query, type, page, limit },
        });
        return response.data;
      } catch (backendError) {
        console.error("Backend search also failed:", backendError);
        throw backendError;
      }
    }
  },

  getBookDetails: async (bookId: string) => {
    try {
      // First try the direct OpenLibrary API
      return await openLibraryDirectApi.getBookDetails(bookId);
    } catch (error) {
      console.warn(
        "Direct OpenLibrary details failed, falling back to backend:",
        error
      );

      // Fallback to backend
      try {
        const response = await backendApi.get(`/api/books/${bookId}`);
        return response.data;
      } catch (backendError) {
        console.error("Backend book details also failed:", backendError);
        throw backendError;
      }
    }
  },
};

// Reading List API
export const readingListApi = {
  getReadingList: async () => {
    const response = await backendApi.get("/api/reading-list");
    return response.data;
  },

  addToReadingList: async (book: {
    book_id: string;
    title: string;
    author: string;
    cover_id?: string;
  }) => {
    const response = await backendApi.post("/api/reading-list", book);
    return response.data;
  },

  removeFromReadingList: async (itemId: number) => {
    await backendApi.delete(`/api/reading-list/${itemId}`);
  },
};

// User API
export const userApi = {
  getCurrentUser: async () => {
    try {
      // Check if token exists before making the request
      if (!authApi.isAuthenticated()) {
        throw new Error("No authentication token found");
      }

      console.log("Getting current user data...");
      const response = await backendApi.get("/api/auth/me");
      console.log("Current user data:", response.data);

      // If we get a successful response but no data, create a placeholder user
      if (!response.data || !response.data.id) {
        console.warn("Got empty user data from API, using placeholder");

        // Try to get user from localStorage as fallback
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            return JSON.parse(storedUser);
          } catch (e) {
            console.error("Error parsing stored user:", e);
          }
        }

        // Create a placeholder user if all else fails
        return {
          id: 1,
          username: "user",
          email: "user@example.com",
        };
      }

      // Store the user data in localStorage for persistence
      localStorage.setItem("user", JSON.stringify(response.data));

      return response.data;
    } catch (error) {
      console.error("Error fetching current user:", error);

      // Try to get user from localStorage as fallback
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        try {
          return JSON.parse(storedUser);
        } catch (e) {
          console.error("Error parsing stored user:", e);
        }
      }

      throw error;
    }
  },

  getUserWithReadingList: async () => {
    try {
      const response = await backendApi.get("/api/users/me/reading-list");
      return response.data;
    } catch (error) {
      console.error("Error fetching user with reading list:", error);
      throw error;
    }
  },
};

// Get book cover image URL
export const getBookCoverUrl = (
  coverId: number | undefined,
  size: string = "M"
): string => {
  if (!coverId) return "https://via.placeholder.com/180x280?text=No+Cover";
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
};

// Compatibility exports for components still using old API structure
export const addToReadingList = (bookData: {
  book_id: string;
  title: string;
  author: string;
  cover_id?: any;
  year?: number;
}) => {
  return readingListApi.addToReadingList(bookData);
};

export const searchBooks = (params: any) => {
  return booksApi.searchBooks(
    params.query,
    params.searchType,
    params.page,
    params.limit
  );
};

export const getBookDetails = (bookId: string) => {
  return booksApi.getBookDetails(bookId);
};

export const getReadingList = () => {
  return readingListApi.getReadingList();
};

export const removeFromReadingList = (id: number) => {
  return readingListApi.removeFromReadingList(id);
};

export const loginUser = (credentials: any) => {
  return authApi.login({
    email: credentials.email || credentials.username,
    password: credentials.password,
  });
};

export const registerUser = (userData: any) => {
  return authApi.register(userData);
};

export const getCurrentUser = () => {
  return userApi.getCurrentUser();
};

export type { BookItem, BookDetail, ReadingListItem };
export default backendApi;
