import React, { useContext, useEffect, useState } from 'react';
import { IPost } from '../../../interfaces/Post';
import { ITag } from '../../../interfaces/Tag';
import PostItem from '../PostPreview/PostPreview';
import { MagnifyingGlass } from 'react-loader-spinner';
import './PublishedPosts.css';
import AuthContext from '../../../contexts/AuthContext';
import { fetchPosts } from '../../../helpers/FetchPosts';

interface Props {
  filter: ITag | string | null;
}

export default function PublishedPosts({ filter }: Props) {
  const { token } = useContext(AuthContext);
  const [activePostList, setActivePostList] = useState<IPost[]>([]);
  const [fullPostList, setFullPostList] = useState<IPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (token) {
      fetchPosts('published', token, setActivePostList, setFullPostList, setLoading, setError);
    }
  }, []);

  useEffect(() => {
    const filterForString = (filter: string) => {
      return fullPostList.filter((post) => {
        return post.title.includes(filter) || post.content.includes(filter);
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

    filter ? setActivePostList(getFilterPosts(filter)) : setActivePostList(fullPostList);
  }, [filter]);

  if (loading) {
    return (
      <div className="fetching">
        <MagnifyingGlass
          visible={true}
          height="80"
          width="80"
          ariaLabel="MagnifyingGlass-loading"
          wrapperStyle={{}}
          wrapperClass="MagnifyingGlass-wrapper"
          glassColor="#c0efff"
          color="#e15b64"
        />
      </div>
    );
  }

  if (error) {
    return <p>An error occurred: {error.message}</p>;
  }

  return (
    <main className="published-posts-list">
      {activePostList?.map((post) => (
        <div key={post._id.toString()} className="post-container">
          <PostItem postData={post} />
        </div>
      ))}
    </main>
  );
}
