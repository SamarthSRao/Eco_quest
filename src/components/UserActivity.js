import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserActivity = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:3000/user-api/user/${userId}`);
        console.log('Fetched user data:', response.data); // Debug: see what you get
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch user data.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleUpdateActivity = async (activityName) => {
    try {
      const response = await axios.post(
        `http://localhost:3000/user-api/user/${userId}/update-activity`,
        { activityName, completed: true }
      );
      setUser(response.data);
    } catch (err) {
      setError('Failed to update activity.');
    }
  };

  if (loading) return <p>Loading user data...</p>;
  if (error) return <p>{error}</p>;
  if (!user) return <p>No user data found.</p>;

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>{userId}'s Activity Dashboard</h2>
      <p>Total Points: <b>{user.userPoints}</b></p>
      <h3>Activities:</h3>
      <ul>
        {user.activities.map(activity => (
          <li key={activity.name} style={{ margin: '10px 0' }}>
            <b>{activity.name}</b> - Points: {activity.points}
            <span style={{ marginLeft: '10px' }}>
              {activity.completed ? (
                <span style={{ color: 'green' }}>✓ Completed</span>
              ) : (
                <button onClick={() => handleUpdateActivity(activity.name)}>
                  Mark as Complete
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserActivity;