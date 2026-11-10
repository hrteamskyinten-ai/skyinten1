import ModuleMCQ from "../models/module_mcq_schema.js";
import ModuleCodingQuestion from "../models/module_coding_question_schema.js";
import courseModel from "../models/course_schema.js";
import progressModel from "../models/progress_schema.js";
import userModel from "../models/user_schema.js";
import axios from "axios";

const JUDGE0_URL = process.env.JUDGE0_URL || 'http://13.202.120.253:2358';

// Language mapping for judge0
const languageMap = {
  python: "71",
  java: "62",
  c: "50",
  cpp: "54",
  javascript: "63",
  sql: "82",
};

// Utility functions
const encodeBase64 = (s = "") => Buffer.from(String(s)).toString("base64");
const decodeBase64 = (s = "") => Buffer.from(String(s), "base64").toString("utf8");

// Test code against test case using judge0
const testCode = async (code, lang_id, testInput) => {
  try {
    const payload = {
      language_id: String(lang_id),
      source_code: encodeBase64(code || ""),
      stdin: encodeBase64(testInput || ""),
    };

    const axiosConfig = {
      params: {
        base64_encoded: 'true',
        wait: 'true',
        fields: '*',
      },
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    };

    const response = await axios.post(`${JUDGE0_URL}/submissions`, payload, axiosConfig);
    return response.data;
  } catch (err) {
    console.error('testCode error:', err.message);
    throw err;
  }
};
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// Utility function to generate unique slug
const generateUniqueSlug = async (baseSlug, Model, excludeId = null) => {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    const query = { slug };
    if (excludeId) query._id = { $ne: excludeId };
    
    const exists = await Model.findOne(query);
    if (!exists) break;
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
};

// ==================== MCQ OPERATIONS ====================

export const createModuleMCQ = async (req, res) => {
  try {
    const { courseId, moduleId, text, options, correctIndex, explanation, difficulty } = req.body;
    const userId = req.userId;

    console.log("createModuleMCQ - Input data:");
    console.log("  userId:", userId);
    console.log("  courseId:", courseId);
    console.log("  moduleId:", moduleId);
    console.log("  text:", text ? text.substring(0, 50) + "..." : "undefined");

    // Validation
    if (!courseId || !moduleId || !text || !Array.isArray(options) || correctIndex === undefined) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: courseId, moduleId, text, options, correctIndex" 
      });
    }

    if (options.length < 2 || options.length > 4) {
      return res.status(400).json({ 
        success: false, 
        message: "Must have 2-4 options" 
      });
    }

    if (correctIndex < 0 || correctIndex >= options.length) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid correct index" 
      });
    }

    // Verify course exists and user is the creator
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Verify module exists
    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }

    // Generate unique slug
    const baseSlug = generateSlug(text);
    const slug = await generateUniqueSlug(baseSlug, ModuleMCQ);

    // Create MCQ
    const newMCQ = new ModuleMCQ({
      courseId,
      moduleId,
      slug,
      text,
      options,
      correctIndex,
      explanation: explanation || "",
      difficulty: difficulty || "medium",
      createdBy: userId
    });

    await newMCQ.save();

    console.log("MCQ created successfully:", newMCQ);

    res.json({
      success: true,
      message: "MCQ created successfully",
      mcq: newMCQ
    });
  } catch (error) {
    console.error("createModuleMCQ error:", error);
    res.status(500).json({ success: false, message: error.message, error: error.toString() });
  }
};

export const updateModuleMCQ = async (req, res) => {
  try {
    const { mcqId } = req.params;
    const { text, options, correctIndex, explanation, difficulty } = req.body;

    const mcq = await ModuleMCQ.findById(mcqId);
    if (!mcq) {
      return res.status(404).json({ success: false, message: "MCQ not found" });
    }

    if (text) {
      const baseSlug = generateSlug(text);
      mcq.slug = await generateUniqueSlug(baseSlug, ModuleMCQ, mcqId);
      mcq.text = text;
    }

    if (Array.isArray(options)) {
      if (options.length < 2 || options.length > 4) {
        return res.status(400).json({ 
          success: false, 
          message: "Must have 2-4 options" 
        });
      }
      mcq.options = options;
    }

    if (correctIndex !== undefined) {
      if (correctIndex < 0 || correctIndex >= mcq.options.length) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid correct index" 
        });
      }
      mcq.correctIndex = parseInt(correctIndex);
    }

    if (explanation !== undefined) mcq.explanation = explanation;
    if (difficulty) mcq.difficulty = difficulty;
    mcq.updatedAt = new Date();

    await mcq.save();

    res.json({
      success: true,
      message: "MCQ updated successfully",
      mcq
    });
  } catch (error) {
    console.error("updateModuleMCQ error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteModuleMCQ = async (req, res) => {
  try {
    const { mcqId } = req.params;

    const mcq = await ModuleMCQ.findById(mcqId);
    if (!mcq) {
      return res.status(404).json({ success: false, message: "MCQ not found" });
    }

    await ModuleMCQ.findByIdAndDelete(mcqId);

    res.json({
      success: true,
      message: "MCQ deleted successfully"
    });
  } catch (error) {
    console.error("deleteModuleMCQ error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getModuleMCQs = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    console.log('getModuleMCQs called with', { courseId, moduleId });

    const mcqs = await ModuleMCQ.find({
      courseId,
      moduleId
    }).populate('createdBy', 'name email').sort({ createdAt: -1 });

    console.log(`getModuleMCQs found ${mcqs.length} items for course ${courseId} module ${moduleId}`);

    res.json({
      success: true,
      mcqs,
      count: mcqs.length
    });
  } catch (error) {
    console.error("getModuleMCQs error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getModuleMCQBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const mcq = await ModuleMCQ.findOne({ slug }).populate('createdBy', 'name email');
    if (!mcq) {
      return res.status(404).json({ success: false, message: "MCQ not found" });
    }

    res.json({
      success: true,
      mcq
    });
  } catch (error) {
    console.error("getModuleMCQBySlug error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== CODING QUESTION OPERATIONS ====================

export const createModuleCodingQuestion = async (req, res) => {
  try {
    const { 
      courseId, moduleId, title, description, problemStatement,
      constraints, examples, language, templateCode, testcases,
      difficulty, timeLimit, memoryLimit, hints
    } = req.body;
    const userId = req.userId;

    console.log("createModuleCodingQuestion - Input data:");
    console.log("  userId:", userId);
    console.log("  courseId:", courseId);
    console.log("  moduleId:", moduleId);
    console.log("  title:", title);

    // Validation
    if (!courseId || !moduleId || !title || !description || !Array.isArray(testcases)) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: courseId, moduleId, title, description, testcases" 
      });
    }

    if (testcases.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "Must have at least 1 test case" 
      });
    }

    // Verify course exists
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Verify module exists
    const module = course.modules.id(moduleId);
    if (!module) {
      return res.status(404).json({ success: false, message: "Module not found" });
    }

    // Generate unique slug
    const baseSlug = generateSlug(title);
    const slug = await generateUniqueSlug(baseSlug, ModuleCodingQuestion);

    // Create coding question
    const newQuestion = new ModuleCodingQuestion({
      courseId,
      moduleId,
      slug,
      title,
      description,
      problemStatement: problemStatement || "",
      constraints: Array.isArray(constraints) ? constraints : [],
      examples: Array.isArray(examples) ? examples : [],
      language: language || "python",
      templateCode: templateCode || "",
      testcases,
      difficulty: difficulty || "medium",
      timeLimit: timeLimit || 5,
      memoryLimit: memoryLimit || 256,
      hints: Array.isArray(hints) ? hints : [],
      createdBy: userId
    });

    await newQuestion.save();

    console.log("Coding question created successfully:", newQuestion);

    res.json({
      success: true,
      message: "Coding question created successfully",
      question: newQuestion
    });
  } catch (error) {
    console.error("createModuleCodingQuestion error:", error);
    res.status(500).json({ success: false, message: error.message, error: error.toString() });
  }
};

export const updateModuleCodingQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const { 
      title, description, problemStatement, constraints, examples,
      language, templateCode, testcases, difficulty, timeLimit,
      memoryLimit, hints
    } = req.body;

    const question = await ModuleCodingQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    if (title) {
      const baseSlug = generateSlug(title);
      question.slug = await generateUniqueSlug(baseSlug, ModuleCodingQuestion, questionId);
      question.title = title;
    }

    if (description) question.description = description;
    if (problemStatement !== undefined) question.problemStatement = problemStatement;
    if (Array.isArray(constraints)) question.constraints = constraints;
    if (Array.isArray(examples)) question.examples = examples;
    if (language) question.language = language;
    if (templateCode !== undefined) question.templateCode = templateCode;
    if (Array.isArray(testcases) && testcases.length > 0) question.testcases = testcases;
    if (difficulty) question.difficulty = difficulty;
    if (timeLimit) question.timeLimit = timeLimit;
    if (memoryLimit) question.memoryLimit = memoryLimit;
    if (Array.isArray(hints)) question.hints = hints;
    
    question.updatedAt = new Date();
    await question.save();

    res.json({
      success: true,
      message: "Coding question updated successfully",
      question
    });
  } catch (error) {
    console.error("updateModuleCodingQuestion error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteModuleCodingQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await ModuleCodingQuestion.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    await ModuleCodingQuestion.findByIdAndDelete(questionId);

    res.json({
      success: true,
      message: "Coding question deleted successfully"
    });
  } catch (error) {
    console.error("deleteModuleCodingQuestion error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getModuleCodingQuestions = async (req, res) => {
  try {
    const { courseId, moduleId } = req.params;
    console.log('getModuleCodingQuestions called with', { courseId, moduleId });

    const questions = await ModuleCodingQuestion.find({
      courseId,
      moduleId
    }).populate('createdBy', 'name email').sort({ createdAt: -1 });

    console.log(`getModuleCodingQuestions found ${questions.length} items for course ${courseId} module ${moduleId}`);

    res.json({
      success: true,
      questions,
      count: questions.length
    });
  } catch (error) {
    console.error("getModuleCodingQuestions error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getModuleCodingQuestionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const question = await ModuleCodingQuestion.findOne({ slug }).populate('createdBy', 'name email');
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    res.json({
      success: true,
      question
    });
  } catch (error) {
    console.error("getModuleCodingQuestionBySlug error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== SUBMISSION ==================== 

const PASS_THRESHOLD = 70; // 70% required to pass

export const submitAssignment = async (req, res) => {
  try {
    const { courseId, moduleId, mcqs, mcqAnswers, codingQuestions, codingSubmissions } = req.body;
    const userId = req.userId;

    console.log("submitAssignment called with", { courseId, moduleId, userId, mcqCount: mcqs?.length, codingCount: codingQuestions?.length });

    if (!courseId || !moduleId || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: courseId, moduleId" 
      });
    }

    // Calculate MCQ score
    let mcqScore = 0;
    let mcqTotal = 0;
    if (mcqs && Array.isArray(mcqs) && mcqs.length > 0) {
      mcqTotal = mcqs.length;
      mcqs.forEach((mcq) => {
        const userAnswer = mcqAnswers?.[mcq._id];
        if (userAnswer === mcq.correctIndex) {
          mcqScore++;
        }
      });
    }

    // Calculate Coding score by running test cases
    let codingScore = 0;
    let codingTotal = 0;
    let totalTestcases = 0;
    let passedTestcases = 0;

    if (codingQuestions && Array.isArray(codingQuestions) && codingQuestions.length > 0 && codingSubmissions && Array.isArray(codingSubmissions)) {
      for (let i = 0; i < codingSubmissions.length; i++) {
        const sub = codingSubmissions[i];
        const question = codingQuestions[i];

        if (!sub.code || !sub.code.trim()) {
          // No code submitted
          continue;
        }

        // Get language ID for judge0
        const language = (sub.language || question.language || 'python').toLowerCase();
        const lang_id = languageMap[language];

        if (!lang_id) {
          console.warn(`Unknown language: ${language}, skipping test cases`);
          codingScore += 0; // Mark as failed since we can't test
          totalTestcases += question.testcases?.length || 0;
          continue;
        }

        let questionPassed = false;
        const testcases = question.testcases || [];
        let questionTestsPassed = 0;

        if (testcases.length === 0) {
          // No test cases defined, give full marks
          codingScore++;
          questionPassed = true;
        } else {
          // Run each test case
          for (const tc of testcases) {
            totalTestcases++;
            try {
              const result = await testCode(sub.code, lang_id, tc.input);
              const stdout = result.stdout ? decodeBase64(result.stdout).trim() : (result.stdout_raw || "").trim();
              const expected = String(tc.expected || tc.expectedOutput || '').trim();

              if (stdout === expected) {
                passedTestcases++;
                questionTestsPassed++;
              }
            } catch (err) {
              console.error(`Test case error for question ${i}:`, err.message);
              // Test case failed
            }
          }

          // If all test cases pass, give score for this question
          if (questionTestsPassed === testcases.length) {
            codingScore++;
            questionPassed = true;
          }
        }

        console.log(`Question ${i}: ${questionPassed ? 'PASS' : 'FAIL'} (${questionTestsPassed || 0}/${testcases.length || 0} tests)`);
      }

      codingTotal = codingQuestions.length;
      console.log(`Coding Results: ${codingScore}/${codingTotal} questions passed, ${passedTestcases}/${totalTestcases} test cases passed`);
    }

    // Calculate combined score (weighted) using test-case based coding evaluation
    // If only MCQs: 100% of MCQ score
    // If only Coding: 100% of coding test-case pass percentage
    // If both: 50% MCQ + 50% Coding (coding measured by passed testcases / total testcases)
    let finalScore = 0;
    const mcqPercentage = mcqTotal > 0 ? (mcqScore / mcqTotal) * 100 : 0;
    const codingTestcaseFraction = totalTestcases > 0 ? (passedTestcases / totalTestcases) : (codingTotal > 0 ? (codingScore / codingTotal) : 0);
    const codingPercentage = codingTestcaseFraction * 100;

    if (mcqTotal > 0 && codingTotal > 0) {
      finalScore = Math.round((mcqPercentage * 0.5) + (codingPercentage * 0.5));
    } else if (mcqTotal > 0) {
      finalScore = Math.round(mcqPercentage);
    } else if (codingTotal > 0) {
      finalScore = Math.round(codingPercentage);
    }

    const isPassed = finalScore >= PASS_THRESHOLD;
    console.log(`submitAssignment: MCQ ${mcqScore}/${mcqTotal}, Coding ${codingScore}/${codingTotal}, Final ${finalScore}%, Passed: ${isPassed}`);

    // If passed, mark assignment as completed and update progress
    if (isPassed) {
      try {
        console.log(`\n========== UPDATING PROGRESS ==========`);
        console.log(`UserId: ${userId}, CourseId: ${courseId}, ModuleId: ${moduleId}`);
        const progress = await progressModel.findOne({ userId, courseId });
        
        if (!progress) {
          console.error(`❌ NO PROGRESS DOCUMENT FOUND for userId: ${userId}, courseId: ${courseId}`);
          console.error(`Cannot update assignment completion without progress record`);
        } else {
          console.log(`✓ Found progress document`);
          console.log(`  - Progress ID: ${progress._id}`);
          console.log(`  - Number of modules: ${progress.modules.length}`);
          console.log(`  - Modules:`, progress.modules.map(m => ({ id: m._id, title: m.moduleTitle })));
          
          // Find module by moduleId (the actual course module ID, not the subdocument _id)
          console.log(`\nSearching for module with ID: "${moduleId}"`);
          let module = progress.modules.find(m => {
            const match = m.moduleId === moduleId;
            console.log(`  Comparing moduleId "${m.moduleId}" with "${moduleId}": ${match}`);
            return match;
          });
          
          if (!module) {
            console.error(`❌ MODULE NOT FOUND in progress.modules`);
            console.error(`Available module IDs:`, progress.modules.map(m => m._id.toString()));
          } else {
            console.log(`✓ Found module: "${module.moduleTitle}"`);
            console.log(`  - Original state: assignmentCompleted=${module.assignmentCompleted}, isCompleted=${module.isCompleted}`);
            console.log(`  - Topics count: ${module.topics ? module.topics.length : 0}`);
            
            // Mark assignment as completed
            module.assignmentCompleted = true;
            module.assignmentCompletedAt = new Date();
            console.log(`✓ Set assignmentCompleted=true`);
            
            // Check if all topics are completed (if topics exist)
            let allTopicsCompleted = true;
            if (module.topics && module.topics.length > 0) {
              allTopicsCompleted = module.topics.every(topic => topic.isCompleted === true);
              console.log(`  - ${module.topics.length} topics found, all completed: ${allTopicsCompleted}`);
            } else {
              console.log(`  - No topics in module`);
            }
            
            // Mark module as complete ONLY if:
            // 1. Assignment is completed (just done)
            // 2. AND all topics are completed (if they exist)
            if (module.assignmentCompleted && allTopicsCompleted) {
              module.isCompleted = true;
              module.completedAt = new Date();
              console.log(`✓✓✓ MODULE FULLY COMPLETED (assignment + all topics)`);
            } else {
              console.log(`⏳ Module still incomplete - Assignment: ${module.assignmentCompleted}, Topics: ${allTopicsCompleted}`);
            }
            
            // Explicitly mark modules array as modified
            console.log(`Calling markModified('modules')...`);
            progress.markModified('modules');
            
            // Save with error handling
            console.log(`Saving progress document...`);
            const saveResult = await progress.save();
            console.log(`✓✓✓ PROGRESS SAVED SUCCESSFULLY`);
            console.log(`  - Saved module state: assignmentCompleted=${saveResult.modules.find(m => m.moduleId === moduleId)?.assignmentCompleted}`);
            
            // Recalculate overall progress (same logic as in updateTopicProgress)
            try {
              const course = await courseModel.findById(courseId);
              if (course) {
                console.log(`\n📊 Recalculating overall progress...`);
                let totalItems = 0;
                let completedItems = 0;
                
                saveResult.modules.forEach(m => {
                  // Count topics
                  totalItems += m.topics.length;
                  completedItems += m.topics.filter(t => t.isCompleted).length;
                  
                  // Count assignment if module has one
                  const moduleData = course.modules.find(mod => mod._id.toString() === m.moduleId);
                  if (moduleData && moduleData.assignment && moduleData.assignment.description) {
                    totalItems += 1;
                    if (m.assignmentCompleted) {
                      completedItems += 1;
                    }
                  }
                });
                
                saveResult.overallProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                console.log(`  - Completed: ${completedItems}/${totalItems} = ${saveResult.overallProgress}%`);
                
                // Check if ALL modules are completed
                if (saveResult.modules.every(m => m.isCompleted)) {
                  saveResult.isCompleted = true;
                  saveResult.completedAt = new Date();
                  console.log(`🎉 ALL MODULES COMPLETED - Course marked as complete`);
                  
                  // Add to user's completedCourses
                  try {
                    const user = await userModel.findById(userId);
                    if (user) {
                      const alreadyCompleted = user.completedCourses && user.completedCourses.some(c => c.courseId.toString() === courseId);
                      if (!alreadyCompleted) {
                        user.completedCourses = user.completedCourses || [];
                        user.completedCourses.push({ courseId, completedAt: new Date() });
                        await user.save();
                        console.log(`✓ Added to user's completedCourses`);
                      }
                    }
                  } catch (userError) {
                    console.error(`⚠️  Error updating user completedCourses:`, userError.message);
                  }
                }
                
                await saveResult.save();
                console.log(`✓ Overall progress updated and saved`);
              }
            } catch (calcError) {
              console.error(`⚠️  Error recalculating overall progress:`, calcError.message);
              // Non-blocking error
            }
          }
        }
        console.log(`========== END PROGRESS UPDATE ==========\n`);
      } catch (progressError) {
        console.error(`❌ ERROR in progress update:`, progressError.message);
        console.error(progressError.stack);
        // Don't fail the submission if progress update fails
      }
    }

    res.json({
      success: true,
      message: isPassed ? "Assignment passed!" : "Assignment failed",
      finalScore,
      isPassed,
      mcqScore,
      mcqTotal,
      codingScore, // number of coding questions fully passed
      codingTotal, // total coding questions
      passedTestcases,
      totalTestcases,
      codingPercentage: Math.round(codingPercentage),
      passThreshold: PASS_THRESHOLD
    });
  } catch (error) {
    console.error("submitAssignment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
