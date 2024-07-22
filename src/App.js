import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [replies, setReplies] = useState([]);
  const [mainInputValue, setMainInputValue] = useState('');
  const [replyInputValues, setReplyInputValues] = useState({});
  const [selectedReply, setSelectedReply] = useState(null);
  const [bookmarks, setBookmarks] = useState([]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const latestReplyRef = useRef(null);

  useEffect(() => {
    if (latestReplyRef.current) {
      latestReplyRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [replies]);

  const handleMainReply = () => {
    if (mainInputValue.trim() === '') return;

    const newReply = { id: Date.now(), text: mainInputValue, replies: [] };
    setReplies([...replies, newReply]);
    setMainInputValue('');
  };

  const handleReply = (parentId) => {
    if (!replyInputValues[parentId] || replyInputValues[parentId].trim() === '') return;

    const newReply = { id: Date.now(), text: replyInputValues[parentId], replies: [] };
    const addReply = (replies) => {
      return replies.map(reply => {
        if (reply.id === parentId) {
          return { ...reply, replies: [...reply.replies, newReply] };
        } else if (reply.replies.length > 0) {
          return { ...reply, replies: addReply(reply.replies) };
        } else {
          return reply;
        }
      });
    };

    setReplies(addReply(replies));
    setReplyInputValues({ ...replyInputValues, [parentId]: '' });
    setSelectedReply(null);
  };

  const handleInputChange = (e, parentId = null) => {
    const value = e.target.value;
    if (parentId === null) {
      setMainInputValue(value);
    } else {
      setReplyInputValues({ ...replyInputValues, [parentId]: value });
    }
  };

  const handleBookmark = (replyId) => {
    if (bookmarks.length < 4 && !bookmarks.includes(replyId)) {
      setBookmarks([...bookmarks, replyId]);
    }
  };

  const handleRestart = () => {
    setReplies([]);
    setBookmarks([]);
    setMainInputValue('');
    setReplyInputValues({});
    setSelectedReply(null);
  };

  const renderReplies = (replies, level = 0) => {
    return replies.map((reply, index) => (
      <div key={reply.id} style={{ marginLeft: `${level * 30}px`, marginTop: index >= 5 ? '10px' : '0' }}>
        <p
          onClick={() => setSelectedReply(reply.id === selectedReply ? null : reply.id)}
          style={{
            color: selectedReply === reply.id ? 'orange' : (reply.replies.length > 0 && level === 0) ? 'green' : 'lightgray',
            cursor: 'pointer'
          }}
        >
          {index >= 4 ? `${index + 1}. ${reply.text}` : reply.text}
        </p>
        {selectedReply === reply.id && (
          <div>
            <input
              type="text"
              value={replyInputValues[reply.id] || ''}
              onChange={(e) => handleInputChange(e, reply.id)}
              placeholder="Reply"
            />
            <button onClick={() => handleReply(reply.id)}>Reply</button>
            <button onClick={() => handleBookmark(reply.id)}>Bookmark</button>
          </div>
        )}
        {reply.replies.length > 0 && renderReplies(reply.replies, level + 1)}
      </div>
    ));
  };

  return (
    <div className="container">
      <div className="App">
        <h1>Infinite Thread</h1>
        <div className="main-thread-reply">
          <input
            type="text"
            value={mainInputValue}
            onChange={(e) => handleInputChange(e)}
            placeholder="Add to the main thread"
          />
          <button onClick={handleMainReply}>Reply</button>
        </div>
        {renderReplies(replies)}
        <div ref={latestReplyRef}></div>
        <div className="bookmark-button" onClick={() => setShowBookmarks(!showBookmarks)}>...</div>
        {showBookmarks && (
          <div className="bookmarks">
            <h2>Bookmarks</h2>
            <ul>
              {bookmarks.map(bookmark => (
                <li key={bookmark} onClick={() => setSelectedReply(bookmark)}>
                  Reply {bookmark}
                </li>
              ))}
            </ul>
          </div>
        )}
        <button className="restart-button" onClick={handleRestart}>Restart</button>
      </div>
    </div>
  );
}

export default App;

