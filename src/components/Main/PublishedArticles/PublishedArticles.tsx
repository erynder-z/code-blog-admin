import React, { useContext, useEffect, useState } from 'react';
import { IArticle } from '../../../interfaces/Article';
import ArticleItem from '../ArticlePreview/ArticlePreview';
import './PublishedArticles.css';
import AuthContext from '../../../contexts/AuthContext';
import { fetchArticleList } from '../../../helpers/FetchArticleList';
import NoArticlePage from '../NoArticlePage/NoArticlePage';
import ArticleFetchingAnimation from '../ArticleFetchingAnimation/ArticleFetchingAnimation';
import NotFoundPage from '../NotFoundPage/NotFoundPage';

export default function PublishedArticles() {
  const { token } = useContext(AuthContext);
  const [fullArticleList, setFullArticleList] = useState<IArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (token) {
      fetchArticleList('published', token, setFullArticleList, setLoading, setError);
    }
  }, []);

  if (loading) {
    return <ArticleFetchingAnimation />;
  }

  if (error) {
    return <NotFoundPage />;
  }

  return (
    <main className="published-articles-list">
      {fullArticleList.length === 0 && <NoArticlePage />}
      {fullArticleList?.map((article) => (
        <div key={article._id.toString()} className="article-container">
          <ArticleItem articleData={article} />
        </div>
      ))}
    </main>
  );
}
