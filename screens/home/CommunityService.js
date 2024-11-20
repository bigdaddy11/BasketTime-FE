import api from '../common/api'

// 게시글 조회
export const fetchPosts = async (categoryId) => {
  try {
    const response = await api.get('/api/posts', { params: { categoryId } });
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
};

// 게시글 생성
export const createPost = async (post) => {
  try {
    const response = await api.post('/api/posts', post);
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    return null;
  }
};

// 게시글 수정
export const updatePost = async (postId, updatedPost) => {
  try {
    const response = await api.put('/api/posts', updatedPost);
    return response.data;
  } catch (error) {
    console.error('Error updating post:', error);
    return null;
  }
};

// 게시글 삭제
export const deletePost = async (postId) => {
  try {
    await api.delete(`/api/posts/${postId}`);
    return true;
  } catch (error) {
    console.error('Error deleting post:', error);
    return false;
  }
};
