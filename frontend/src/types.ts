// Book Search Types
export interface BookItem {
  key?: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  id?: string;
}

export interface BookDetail {
  id: string;
  title: string;
  description?: string;
  subjects?: string[];
  cover_id?: number;
  cover_i?: number;
  authors?: { name: string }[];
  created?: string;
  last_modified?: string;
  publish_date?: string;
  isbn_13?: string[];
  isbn_10?: string[];
}

// Reading List Types
export interface ReadingListItem {
  id: number;
  book_id: string;
  title: string;
  author?: string;
  cover_id?: string;
  added_at: string;
  user_id: number;
}

// User Types
export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface UserWithReadingList extends User {
  reading_list: ReadingListItem[];
} 