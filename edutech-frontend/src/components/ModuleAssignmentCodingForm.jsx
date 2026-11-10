import React, { useState, useContext, useEffect } from "react";
import { AppContext } from "../context/Appcontext";
import axios from "axios";
import { toast } from "react-toastify";
import "../styles/moduleAssignmentForm.css";

function ModuleAssignmentCodingForm({ courseId, moduleId, onSuccess, onCancel }) {
  const { backendUrl } = useContext(AppContext);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    problemStatement: "",
    constraints: [""],
    examples: [{ input: "", output: "", explanation: "" }],
    language: "python",
    templateCode: "",
    testcases: [{ input: "", expected: "" }],
    difficulty: "medium",
    timeLimit: 5,
    memoryLimit: 256,
    hints: [""]
  });
  const [loading, setLoading] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  useEffect(() => {
    fetchCodingQuestions();
  }, [courseId, moduleId]);

  const fetchCodingQuestions = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/module-assignment/coding/${courseId}/${moduleId}`
      );
      if (data.success) {
        setSelectedQuestions(data.questions || []);
      }
    } catch (err) {
      console.error("Error fetching coding questions:", err);
    }
  };

  const handleArrayChange = (field, index, value) => {
    const newArray = [...formData[field]];
    if (typeof newArray[index] === "object") {
      newArray[index] = { ...newArray[index], ...value };
    } else {
      newArray[index] = value;
    }
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayItem = (field) => {
    const newArray = [...formData[field]];
    if (field === "examples") {
      newArray.push({ input: "", output: "", explanation: "" });
    } else if (field === "testcases") {
      newArray.push({ input: "", expected: "" });
    } else {
      newArray.push("");
    }
    setFormData({ ...formData, [field]: newArray });
  };

  const removeArrayItem = (field, index) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Coding Form Submit - courseId:", courseId, "moduleId:", moduleId, "editingId:", editingId);
    console.log("FormData:", formData);

    // Validation
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Title and description are required");
      return;
    }

    if (formData.testcases.filter(tc => tc.input && tc.expected).length === 0) {
      toast.error("At least 1 test case is required");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        courseId,
        moduleId,
        title: formData.title,
        description: formData.description,
        problemStatement: formData.problemStatement,
        constraints: formData.constraints.filter(c => c.trim()),
        examples: formData.examples.filter(ex => ex.input && ex.output),
        language: formData.language,
        templateCode: formData.templateCode,
        testcases: formData.testcases.filter(tc => tc.input && tc.expected),
        difficulty: formData.difficulty,
        timeLimit: parseInt(formData.timeLimit),
        memoryLimit: parseInt(formData.memoryLimit),
        hints: formData.hints.filter(h => h.trim())
      };

      let data;
      if (editingId) {
        const res = await axios.put(`${backendUrl}/api/module-assignment/coding/${editingId}`, payload, { withCredentials: true });
        data = res.data;
      } else {
        const res = await axios.post(`${backendUrl}/api/module-assignment/coding/create`, payload, { withCredentials: true });
        data = res.data;
      }

      console.log("Coding Create/Update Response:", data);

      if (data.success) {
        toast.success(editingId ? "Coding question updated successfully" : "Coding question created successfully");
        setFormData({
          title: "",
          description: "",
          problemStatement: "",
          constraints: [""],
          examples: [{ input: "", output: "", explanation: "" }],
          language: "python",
          templateCode: "",
          testcases: [{ input: "", expected: "" }],
          difficulty: "medium",
          timeLimit: 5,
          memoryLimit: 256,
          hints: [""]
        });
        fetchCodingQuestions();
        setEditingId(null);
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message || (editingId ? "Failed to update coding question" : "Failed to create coding question"));
        console.error("Coding Creation/Update Failed:", data);
      }
    } catch (err) {
      console.error("Coding API Error:", err);
      toast.error(err.response?.data?.message || (editingId ? "Error updating coding question" : "Error creating coding question"));
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (question) => {
    setEditingId(question._id);
    setFormData({
      title: question.title || "",
      description: question.description || "",
      problemStatement: question.problemStatement || "",
      constraints: (question.constraints && question.constraints.length) ? question.constraints : [""],
      examples: (question.examples && question.examples.length) ? question.examples : [{ input: "", output: "", explanation: "" }],
      language: question.language || "python",
      templateCode: question.templateCode || "",
      testcases: (question.testcases && question.testcases.length) ? question.testcases.map(tc => ({ input: tc.input || "", expected: tc.expected || tc.expectedOutput || "" })) : [{ input: "", expected: "" }],
      difficulty: question.difficulty || "medium",
      timeLimit: question.timeLimit || 5,
      memoryLimit: question.memoryLimit || 256,
      hints: (question.hints && question.hints.length) ? question.hints : [""]
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      problemStatement: "",
      constraints: [""],
      examples: [{ input: "", output: "", explanation: "" }],
      language: "python",
      templateCode: "",
      testcases: [{ input: "", expected: "" }],
      difficulty: "medium",
      timeLimit: 5,
      memoryLimit: 256,
      hints: [""]
    });
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      const { data } = await axios.delete(
        `${backendUrl}/api/module-assignment/coding/${questionId}`,
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Question deleted successfully");
        fetchCodingQuestions();
      }
    } catch (err) {
      toast.error("Error deleting question");
    }
  };

  return (
    <div className="module-assignment-form">
      <div className="form-header">
        <h2>{editingId ? "Edit Module Assignment Coding Question" : "Create Module Assignment Coding Question"}</h2>
        <div>
          {editingId && (
            <button className="cancel-edit-btn" onClick={handleCancelEdit}>Cancel Edit</button>
          )}
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="coding-form">
        <div className="form-row">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Problem title"
              required
            />
          </div>

          <div className="form-group">
            <label>Language</label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            >
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
            </select>
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
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Problem description"
            rows="3"
            required
          />
        </div>

        <div className="form-group">
          <label>Problem Statement (Optional)</label>
          <textarea
            value={formData.problemStatement}
            onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })}
            placeholder="Detailed problem statement"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Template Code (Optional)</label>
          <textarea
            value={formData.templateCode}
            onChange={(e) => setFormData({ ...formData, templateCode: e.target.value })}
            placeholder="Code template for students"
            rows="4"
            style={{ fontFamily: "monospace" }}
          />
        </div>

        <div className="form-group">
          <label>Constraints</label>
          {formData.constraints.map((constraint, index) => (
            <div key={index} className="array-item">
              <input
                type="text"
                value={constraint}
                onChange={(e) => handleArrayChange("constraints", index, e.target.value)}
                placeholder={`Constraint ${index + 1}`}
              />
              {formData.constraints.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeArrayItem("constraints", index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-btn"
            onClick={() => addArrayItem("constraints")}
          >
            + Add Constraint
          </button>
        </div>

        <div className="form-group">
          <label>Examples</label>
          {formData.examples.map((example, index) => (
            <div key={index} className="example-item">
              <input
                type="text"
                value={example.input}
                onChange={(e) => handleArrayChange("examples", index, { input: e.target.value })}
                placeholder="Input"
              />
              <input
                type="text"
                value={example.output}
                onChange={(e) => handleArrayChange("examples", index, { output: e.target.value })}
                placeholder="Output"
              />
              <input
                type="text"
                value={example.explanation}
                onChange={(e) => handleArrayChange("examples", index, { explanation: e.target.value })}
                placeholder="Explanation"
              />
              {formData.examples.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeArrayItem("examples", index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-btn"
            onClick={() => addArrayItem("examples")}
          >
            + Add Example
          </button>
        </div>

        <div className="form-group">
          <label>Test Cases * (at least 1)</label>
          {formData.testcases.map((testcase, index) => (
            <div key={index} className="testcase-item">
              <textarea
                value={testcase.input}
                onChange={(e) => handleArrayChange("testcases", index, { input: e.target.value })}
                placeholder="Input"
                rows="2"
              />
              <textarea
                value={testcase.expected}
                onChange={(e) => handleArrayChange("testcases", index, { expected: e.target.value })}
                placeholder="Expected Output"
                rows="2"
              />
              {formData.testcases.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeArrayItem("testcases", index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-btn"
            onClick={() => addArrayItem("testcases")}
          >
            + Add Test Case
          </button>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Time Limit (seconds)</label>
            <input
              type="number"
              value={formData.timeLimit}
              onChange={(e) => setFormData({ ...formData, timeLimit: e.target.value })}
              min="1"
              max="60"
            />
          </div>

          <div className="form-group">
            <label>Memory Limit (MB)</label>
            <input
              type="number"
              value={formData.memoryLimit}
              onChange={(e) => setFormData({ ...formData, memoryLimit: e.target.value })}
              min="32"
              max="1024"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Hints (Optional)</label>
          {formData.hints.map((hint, index) => (
            <div key={index} className="array-item">
              <input
                type="text"
                value={hint}
                onChange={(e) => handleArrayChange("hints", index, e.target.value)}
                placeholder={`Hint ${index + 1}`}
              />
              {formData.hints.length > 1 && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeArrayItem("hints", index)}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="add-btn"
            onClick={() => addArrayItem("hints")}
          >
            + Add Hint
          </button>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? (editingId ? "Updating..." : "Creating...") : (editingId ? "Update Coding Question" : "Create Coding Question")}
        </button>
      </form>

      {selectedQuestions.length > 0 && (
        <div className="questions-list">
          <h3>Module Coding Questions ({selectedQuestions.length})</h3>
          <div className="questions-items">
            {selectedQuestions.map((question) => (
              <div key={question._id} className="question-item">
                <div className="question-content">
                  <h4>{question.title}</h4>
                  <p>{question.description}</p>
                  <div className="question-meta">
                    <span className="language-badge">{question.language}</span>
                    <span className="difficulty-badge" data-difficulty={question.difficulty}>
                      {question.difficulty}
                    </span>
                    <span className="testcase-count">
                      {question.testcases?.length || 0} test cases
                    </span>
                  </div>
                </div>
                <div className="question-actions">
                  <button
                    className="edit-btn"
                    onClick={() => handleEditQuestion(question)}
                    title="Edit Question"
                  >
                    ✏️
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteQuestion(question._id)}
                    title="Delete Question"
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

export default ModuleAssignmentCodingForm;
