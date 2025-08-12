import React, { useState } from 'react';
import { createGroup } from '../apis/groupAPI';

const GroupForm = () => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name) {
      setError('Please provide both name');
      return;
    }

    try {
	const userId = localStorage.getItem('userId')
	console.log(userId)
      await createGroup(userId, name);
      setSuccess('Group created successfully!');
      setName('');
      setError('');
    } catch (err) {
      setError('Error creating group');
      console.error(err);
    }
  };

  return (
    <div>
      <h2>Create a Group</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Group Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter group name"
          />
        </div>
        <button type="submit">Create Group</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
    </div>
  );
};

export default GroupForm;
