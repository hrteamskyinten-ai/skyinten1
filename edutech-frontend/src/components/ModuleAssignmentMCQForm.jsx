import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/Appcontext";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/moduleAssignmentForm.css";

function ModuleAssignmentMCQForm({ courseId, moduleId, onSuccess, onCancel }) {
  const { backendUrl } = useContext(AppContext);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    text: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    explanation: "",
    difficulty: "medium"
  });
  const [loading, setLoading] = useState(false);
  const [selectedMCQs, setSelectedMCQs] = useState([]);

  useEffect(() => {
    fetchMCQs();
  }, [courseId, moduleId]);

  const fetchMCQs = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/module-assignment/mcq/${courseId}/${moduleId}`
      );
      if (data.success) {
        setSelectedMCQs(data.mcqs || []);
      }
    } catch (err) {
      console.error("Error fetching MCQs:", err);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleCorrectIndexChange = (index) => {
    setFormData({ ...formData, correctIndex: parseInt(index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("MCQ Form Submit - courseId:", courseId, "moduleId:", moduleId);
    console.log("FormData:", formData);

    // Validation
    if (!formData.text.trim()) {
      toast.error("Question text is required");
      return;
    }

    const filledOptions = formData.options.filter(opt => opt.trim());
    if (filledOptions.length < 2) {
      toast.error("At least 2 options are required");
      return;
    }

    if (formData.correctIndex >= filledOptions.length) {
      toast.error("Invalid correct answer index");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        courseId,
        moduleId,
        text: formData.text,
        options: filledOptions,
        correctIndex: formData.correctIndex,
        explanation: formData.explanation,
        difficulty: formData.difficulty
      };

      let data;
      if (editingId) {
        const res = await axios.put(`${backendUrl}/api/module-assignment/mcq/${editingId}`, payload, { withCredentials: true });
        data = res.data;
      } else {
        const res = await axios.post(`${backendUrl}/api/module-assignment/mcq/create`, payload, { withCredentials: true });
        data = res.data;
      }

      console.log("MCQ Create/Update Response:", data);

      if (data.success) {
        toast.success(editingId ? "MCQ updated successfully" : "MCQ created successfully");
        setFormData({
          text: "",
          options: ["", "", "", ""],
          correctIndex: 0,
          explanation: "",
          difficulty: "medium"
        });
        fetchMCQs();
        setEditingId(null);
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message || (editingId ? "Failed to update MCQ" : "Failed to create MCQ"));
        console.error("MCQ Creation/Update Failed:", data);
      }
    } catch (err) {
      console.error("MCQ API Error:", err);
      toast.error(err.response?.data?.message || (editingId ? "Error updating MCQ" : "Error creating MCQ"));
    } finally {
      setLoading(false);
    }
  };

  const handleEditMCQ = (mcq) => {
    setEditingId(mcq._id);
    setFormData({
      text: mcq.text || "",
      options: mcq.options && mcq.options.length ? mcq.options.concat(Array(4 - mcq.options.length).fill("")) : ["", "", "", ""],
      correctIndex: mcq.correctIndex || 0,
      explanation: mcq.explanation || "",
      difficulty: mcq.difficulty || "medium"
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      text: "",
      options: ["", "", "", ""],
      correctIndex: 0,
      explanation: "",
      difficulty: "medium"
    });
  };

  const handleDeleteMCQ = async (mcqId) => {
    if (!window.confirm("Are you sure you want to delete this MCQ?")) return;

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/module-assignment/mcq/${mcqId}`,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("MCQ deleted successfully");
        fetchMCQs();
      }
    } catch (err) {
      toast.error("Error deleting MCQ");
    }
  };

  return (
    <div className="module-assignment-form">
          <div className="form-header">
            <h2>{editingId ? "Edit Module Assignment MCQ" : "Create Module Assignment MCQ"}</h2>
            <div>
              {editingId && (
                <button className="cancel-edit-btn" onClick={handleCancelEdit}>Cancel Edit</button>
              )}
              <button className="close-btn" onClick={onCancel}>✕</button>
            </div>
          </div>

      <form onSubmit={handleSubmit} className="mcq-form">
        <div className="form-group">
          <label>Question Text *</label>
          <textarea
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            placeholder="Enter the question text"
            rows="3"
            required
          />
        </div>

        <div className="form-group">
          <label>Options (minimum 2, maximum 4) *</label>
          {formData.options.map((option, index) => (
            <div key={index} className="option-input-group">
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
              />
              <input
                type="radio"
                name="correct"
                checked={formData.correctIndex === index}
                onChange={() => handleCorrectIndexChange(index)}
                title="Select correct answer"
              />
            </div>
          ))}
        </div>

        <div className="form-group">
          <label>Difficulty</label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div className="form-group">
          <label>Explanation (Optional)</label>
          <textarea
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            placeholder="Explain why the correct answer is right"
            rows="2"
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (editingId ? "Updating..." : "Creating...") : (editingId ? "Update MCQ" : "Create MCQ")}
        </button>
      </form>

      {selectedMCQs.length > 0 && (
        <div className="mcq-list">
          <h3>Module MCQs ({selectedMCQs.length})</h3>
          <div className="mcq-items">
            {selectedMCQs.map((mcq) => (
              <div key={mcq._id} className="mcq-item">
                <div className="mcq-content">
                  <p className="mcq-question">{mcq.text}</p>
                  <div className="mcq-options">
                    {mcq.options.map((opt, idx) => (
                      <div key={idx} className={`mcq-option ${idx === mcq.correctIndex ? "correct" : ""}`}>
                        {opt} {idx === mcq.correctIndex && <span className="correct-badge">✓</span>}
                      </div>
                    ))}
                  </div>
                  <div className="mcq-meta">
                    <span className="difficulty-badge" data-difficulty={mcq.difficulty}>{mcq.difficulty}</span>
                  </div>
                </div>
                <div className="mcq-actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEditMCQ(mcq)}
                    title="Edit MCQ"
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteMCQ(mcq._id)}
                    title="Delete MCQ"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ModuleAssignmentMCQForm;
