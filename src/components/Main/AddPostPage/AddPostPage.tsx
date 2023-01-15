import React, { ChangeEvent, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Editor as TinyMCEEditor } from 'tinymce';
import './AddPostPage.css';
import { ITag } from '../../../interfaces/Tag';
import { useNavigate } from 'react-router-dom';
import InfoText from '../InfoText/InfoText';
import AuthContext from '../../../contexts/AuthContext';

export default function AddPostPage() {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tagList, setTagList] = useState<ITag[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showInfoText, setShowInfoText] = useState<boolean>(false);
  const [infoTextMessage, setInfoTextMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (token) {
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);
      const body = {
        ...Object.fromEntries(formData),
        title: formData.get('title'),
        text: editorRef.current ? editorRef.current.getContent() : ''
      };

      const response = await fetch('http://localhost:8000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        const data = await response.json();
        successfullSubmit();
      } else {
        console.error(response.statusText);
        failedSubmit();
      }
    }
  };

  const fetchTagListData = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/tags');
      const data = await res.json();
      setTagList(data.tag_list);
    } catch (err: any) {
      setError(err);
    }
    setLoading(false);
  };

  const successfullSubmit = () => {
    setInfoTextMessage('success!');
    setShowInfoText(true);
    const timeoutId = setTimeout(() => {
      navigate('/all');
    }, 3000);
    return () => clearTimeout(timeoutId);
  };

  const failedSubmit = () => {
    setInfoTextMessage('something went wrong!');
    setShowInfoText(true);
    const timeoutId = setTimeout(() => {
      navigate('/all');
    }, 3000);
    return () => clearTimeout(timeoutId);
  };

  useEffect(() => {
    fetchTagListData();
  }, []);

  const editorRef = useRef<TinyMCEEditor | null>(null);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>An error occurred: {error.message}</p>;
  }

  return (
    <main className="add-post_page">
      {showInfoText ? (
        <InfoText message={infoTextMessage} />
      ) : (
        <div className="add-post_container">
          <form onSubmit={handleSubmit}>
            <h1 className="add-post_heading">Add post</h1>
            <div className="tags-container">
              <label htmlFor="tags">Tags</label>
              <div className="create-post-tag-list">
                {tagList?.map((tag) => (
                  <div key={tag._id} className="checkbox-container">
                    <input type="checkbox" id={tag.name} name={tag.name} value={tag._id} />
                    <label htmlFor={tag.name}>{tag.name}</label>
                  </div>
                ))}
              </div>
            </div>
            <div className="title-container">
              <h2>title:</h2>
              <input type="text" name="title" />
            </div>
            <div className="editor-container">
              <h2>content:</h2>
              <Editor
                apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                onInit={(evt, editor) => (editorRef.current = editor)}
                initialValue="<p>What's todays topic?</p>"
                init={{
                  height: 500,
                  menubar: false,
                  plugins: [
                    'advlist',
                    'autolink',
                    'lists',
                    'link',
                    'image',
                    'charmap',
                    'preview',
                    'anchor',
                    'searchreplace',
                    'visualblocks',
                    'code',
                    'fullscreen',
                    'insertdatetime',
                    'media',
                    'table',
                    'code',
                    'help',
                    'wordcount'
                  ],
                  toolbar:
                    'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | image | bullist numlist outdent indent | ' +
                    'removeformat | help',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
                  file_picker_callback: (cb, value, meta) => {
                    const createFileInput = () => {
                      const input = document.createElement('input');
                      input.setAttribute('type', 'file');
                      input.setAttribute('accept', 'image/*');
                      return input;
                    };

                    const handleFileSelected =
                      (cb: (value: string, meta?: Record<string, any> | undefined) => void) =>
                      (event: Event) => {
                        if (event.target && event.target.files) {
                          const file = event.target?.files[0];
                          const reader = new FileReader();
                          reader.onload = handleFileRead(cb, file);
                          reader.readAsDataURL(file);
                        }
                      };

                    const handleFileRead =
                      (
                        cb: (value: string, meta?: Record<string, any> | undefined) => void,
                        file: File
                      ) =>
                      (event: ProgressEvent<FileReader>) => {
                        if (event.target) {
                          const base64 = (event.target.result as string)?.split(',')[1];

                          const blobCache = tinymce.activeEditor?.editorUpload.blobCache;
                          const id = createBlobId();
                          const blobInfo = blobCache.create(id, file, base64);

                          blobCache.add(blobInfo);
                          cb(blobInfo.blobUri(), { title: file.name });
                        }
                      };

                    const createBlobId = () => {
                      return 'blobid' + new Date().getTime();
                    };
                    const fileInput = createFileInput();
                    fileInput.onchange = handleFileSelected(cb);
                    fileInput.click();
                  }
                }}
              />
            </div>
            <div className="create-post-publish-options">
              <div className="checkbox-container">
                <input type="checkbox" id="publishPost" name="publishPost" />
                <label htmlFor="publishPost">publish post when submitting</label>
              </div>
            </div>
            <button type="submit">Submit post</button>
          </form>
        </div>
      )}
    </main>
  );
}
