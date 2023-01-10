import React, { useEffect, useState } from 'react';
import { IPost } from '../../../interfaces/Post';
import { ITag } from '../../../interfaces/Tag';
import PostItem from '../PostPreview/PostPreview';
import './UnpublishedPosts.css';

interface Props {
  filter: ITag | string | null;
  token: string | null;
}

export default function UnpublishedPosts({ filter, token }: Props) {
  const [activePostList, setActivePostList] = useState<IPost[]>([]);
  const [fullPostList, setFullPostList] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/admin/posts/unpublished', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        setActivePostList(data.post_list);
        setFullPostList(data.post_list);
      } catch (err: any) {
        setError(err);
      }
      setLoading(false);
    };
    if (token) {
      fetchPosts();
    }
  }, []);

  useEffect(() => {
    const filterForString = (filter: string) => {
      return fullPostList.filter((post) => {
        return post.title.includes(filter) || post.text.includes(filter);
      });
    };

    const filterForTag = (filter: ITag) => {
      return fullPostList.filter((post) => post?.tags?.some((tag) => tag._id == filter?._id));
    };

    const getFilterPosts = (filter: ITag | string | null) => {
      return typeof filter === 'string'
        ? filterForString(filter as string)
        : filterForTag(filter as ITag);
    };

    setActivePostList(getFilterPosts(filter));
  }, [filter]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>An error occurred: {error.message}</p>;
  }

  return (
    <main className="unpublished-posts-list">
      {activePostList?.map((post) => (
        <div key={post._id.toString()} className="post-container">
          <PostItem postData={post} />
        </div>
      ))}
    </main>
  );
}