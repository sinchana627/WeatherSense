import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../css/Profile.css";

const Profile = ({ user, onUpdate }) => {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", city: "", photo: "" });
  const [photoFile, setPhotoFile] = useState(null);

  // Load profile from server on mount
  useEffect(() => {
    // Load profile from localStorage if available
    const stored = {
      name: localStorage.getItem('username') || '',
      email: localStorage.getItem('email') || '',
      city: localStorage.getItem('city') || '',
      photo: ''
    };
// ...existing code...
// ...existing code...
    setForm(stored);
    onUpdate && onUpdate(stored);

    async function fetchProfile() {
      try {
        const res = await axios.get("/api/profile");
        setForm(res.data);
        onUpdate && onUpdate(res.data);
      } catch {
        // fallback to localStorage if API fails
      }
    }
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      let profileData = { ...form };
      if (photoFile) {
        const formData = new FormData();
        formData.append('photo', photoFile);
        formData.append('name', form.name);
        formData.append('email', form.email);
        formData.append('city', form.city);
        const res = await axios.post("/api/profile/save", formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        setForm(res.data);
        onUpdate && onUpdate(res.data);
        setEditMode(false);
        setPhotoFile(null);
        if (res.data.photo) {
          localStorage.setItem('profilePhoto', res.data.photo);
        }
        return;
      }
      const res = await axios.post("/api/profile/save", profileData);
      setForm(res.data);
      onUpdate && onUpdate(res.data);
      setEditMode(false);
      if (res.data.photo) {
        localStorage.setItem('profilePhoto', res.data.photo);
      }
    } catch (err) {
      alert("Failed to save profile.");
    }
  };

  const handleDelete = async () => {
    try {
      await axios.post("/api/profile/delete", { email: form.email });
      setForm({ name: "", email: "", city: "" });
      onUpdate && onUpdate({ name: "", email: "", city: "" });
    } catch (err) {
      alert("Failed to delete profile.");
    }
  };

  return (
    <div className="profile-container">
      {editMode ? (
        <div className="profile-form">
          <input name="name" value={form.name} onChange={handleChange} placeholder="Name" />
          <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
          <input name="city" value={form.city} onChange={handleChange} placeholder="City" />
          <div className="profile-photo-upload">
            <label>Profile Photo:</label>
            <input type="file" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} />
            {photoFile && <img src={URL.createObjectURL(photoFile)} alt="Preview" style={{ width: 80, height: 80, borderRadius: '50%', marginTop: 8 }} />}
          </div>
          <button onClick={handleSave}>Save</button>
          <button onClick={() => setEditMode(false)}>Cancel</button>
        </div>
      ) : (
        <div className="profile-details">
          <div className="profile-photo">
            {form.photo ? (
              <img src={form.photo} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%' }} />
            ) : (
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>
                👤
              </div>
            )}
          </div>
          <div><strong>Name:</strong> {form.name}</div>
          <div><strong>Email:</strong> {form.email}</div>
          <div><strong>City:</strong> {form.city}</div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
            <button
              onClick={() => setEditMode(true)}
              style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4em 1.2em', fontWeight: 600, fontSize: '1em', cursor: 'pointer' }}
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              style={{ background: '#d9534f', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4em 1.2em', fontWeight: 600, fontSize: '1em', cursor: 'pointer' }}
            >
              Delete
            </button>
            {/* Back to Dashboard button removed as requested */}
          </div>
        </div>
      )}
      </div>
    );
  };
export default Profile;
