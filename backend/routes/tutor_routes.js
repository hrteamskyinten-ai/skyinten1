import express from "express";
import tutorModel from "../models/tutor_schema.js";
import courseModel from "../models/course_schema.js";
import userAuth from "../middleware/userAuth.js";
import { uploadVideoFile } from "../middleware/multer.js";

const router = express.Router();

// Upload video to tutor's course
router.post("/upload-video", userAuth, uploadVideoFile, async (req, res) => {
  try {
    const { tutorId, courseId, title } = req.body;
    const videoLink = req.body.videoLink || null;
    
    // Validate required fields
    if (!tutorId || !courseId || !title) {
      return res.json({
        success: false,
        message: "Tutor ID, Course ID, and Title are required"
      });
    }

    // Check if tutor exists
    const tutor = await tutorModel.findById(tutorId);
    if (!tutor) {
      return res.json({
        success: false,
        message: "Tutor not found"
      });
    }

    // Check if course is assigned to tutor
    const courseIsAssigned = tutor.assignedCourses.some(
      (cId) => cId.toString() === courseId
    );
    if (!courseIsAssigned) {
      return res.json({
        success: false,
        message: "Course is not assigned to this tutor"
      });
    }

    // Check if course exists
    const course = await courseModel.findById(courseId);
    if (!course) {
      return res.json({
        success: false,
        message: "Course not found"
      });
    }

    // Create video object
    const videoObj = {
      videoId: `video_${Date.now()}`,
      title: title,
      courseId: courseId,
      videoUrl: req.file ? `/uploads/videos/${req.file.filename}` : videoLink,
      thumbnail: null,
      duration: null,
      views: 0,
      uploadedAt: new Date()
    };

    // Add video to tutor's tutorVideos array
    if (!tutor.tutorVideos) {
      tutor.tutorVideos = [];
    }
    tutor.tutorVideos.push(videoObj);

    // Save tutor document
    await tutor.save();

    // Add video to course's courseResources if field exists
    if (course.courseResources) {
      course.courseResources.push({
        resourceType: "video",
        tutorId: tutorId,
        title: title,
        description: null,
        url: videoObj.videoUrl,
        uploadedDate: new Date()
      });
      await course.save();
    }

    res.json({
      success: true,
      message: "Video uploaded successfully",
      video: videoObj
    });

  } catch (error) {
    console.error("Video upload error:", error);
    res.json({
      success: false,
      message: error.message || "Failed to upload video"
    });
  }
});

// Upload/Schedule meet for tutor's course
router.post("/upload-meet", userAuth, async (req, res) => {
  try {
    const { tutorId, courseId, title, meetLink, meetTime, status } = req.body;

    console.log('Upload meet request:', { tutorId, courseId, title, meetLink, meetTime, status });

    // Validate required fields
    if (!tutorId || !courseId || !title || !meetLink || !meetTime) {
      return res.json({
        success: false,
        message: "All fields (Course, Title, Link, Time) are required"
      });
    }

    // Check if tutor exists
    const tutor = await tutorModel.findById(tutorId);
    if (!tutor) {
      console.log('Tutor not found:', tutorId);
      return res.json({
        success: false,
        message: "Tutor not found"
      });
    }

    // Check if course is assigned to tutor
    const courseIsAssigned = tutor.assignedCourses.some(
      (cId) => cId.toString() === courseId
    );
    if (!courseIsAssigned) {
      return res.json({
        success: false,
        message: "Course is not assigned to this tutor"
      });
    }

    // Check if course exists
    const course = await courseModel.findById(courseId);
    if (!course) {
      console.log('Course not found:', courseId);
      return res.json({
        success: false,
        message: "Course not found"
      });
    }

    // Create meet object
    const meetId = `meet_${Date.now()}`;
    const meetObj = {
      meetId: meetId,
      title: title,
      description: null,
      tutorId: tutorId,
      courseId: courseId,
      meetDate: new Date(meetTime),
      meetTime: meetTime,
      duration: null,
      meetLink: meetLink,
      status: status || 'scheduled',
      students: [],
      createdAt: new Date()
    };

    // Add meet to tutor's tutorMeets array
    if (!tutor.tutorMeets) {
      tutor.tutorMeets = [];
    }
    tutor.tutorMeets.push(meetObj);

    // Save tutor document
    await tutor.save();

    // Add meet to course's liveMeets array
    if (!course.liveMeets) {
      course.liveMeets = [];
    }
    course.liveMeets.push({
      meetId: meetId,
      tutorId: tutorId,
      title: title,
      meetLink: meetLink,
      meetTime: new Date(meetTime),
      description: null,
      duration: null,
      status: status || 'scheduled',
      students: [],
      createdAt: new Date()
    });

    // Save course document
    await course.save();

    res.json({
      success: true,
      message: "Meet scheduled successfully",
      meet: meetObj
    });

  } catch (error) {
    console.error("Meet schedule error:", error);
    res.json({
      success: false,
      message: error.message || "Failed to schedule meet"
    });
  }
});

// Get tutor's videos and meets
router.get("/resources/:tutorId", userAuth, async (req, res) => {
  try {
    const { tutorId } = req.params;

    const tutor = await tutorModel.findById(tutorId)
      .populate("assignedCourses")
      .populate("tutorVideos.courseId")
      .populate("tutorMeets");
    
    if (!tutor) {
      return res.json({
        success: false,
        message: "Tutor not found"
      });
    }

    // Combine and format resources
    const resources = [];

    // Add videos
    if (tutor.tutorVideos && Array.isArray(tutor.tutorVideos)) {
      tutor.tutorVideos.forEach(video => {
        resources.push({
          _id: video._id || video.videoId,
          resourceType: 'video',
          title: video.title,
          courseId: video.courseId,
          videoFile: video.videoUrl,
          videoLink: video.videoUrl,
          createdAt: video.uploadedAt
        });
      });
    }

    // Add meets
    if (tutor.tutorMeets && Array.isArray(tutor.tutorMeets)) {
      tutor.tutorMeets.forEach(meet => {
        resources.push({
          _id: meet._id || meet.meetId,
          resourceType: 'meet',
          title: meet.title,
          meetLink: meet.meetLink,
          meetTime: meet.meetDate || meet.meetTime,
          createdAt: meet.createdAt
        });
      });
    }

    res.json({
      success: true,
      resources: resources,
      courses: tutor.assignedCourses || []
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message || "Failed to fetch resources"
    });
  }
});

// Delete video
router.delete("/video/:tutorId/:videoId", userAuth, async (req, res) => {
  try {
    const { tutorId, videoId } = req.params;

    const tutor = await tutorModel.findById(tutorId);
    if (!tutor) {
      return res.json({
        success: false,
        message: "Tutor not found"
      });
    }

    // Remove video from tutorVideos array by _id or videoId
    tutor.tutorVideos = tutor.tutorVideos.filter(
      (video) => video._id.toString() !== videoId && video.videoId !== videoId
    );

    await tutor.save();

    res.json({
      success: true,
      message: "Video deleted successfully"
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message || "Failed to delete video"
    });
  }
});

// Delete meet
router.delete("/meet/:tutorId/:meetId", userAuth, async (req, res) => {
  try {
    const { tutorId, meetId } = req.params;

    const tutor = await tutorModel.findById(tutorId);
    if (!tutor) {
      return res.json({
        success: false,
        message: "Tutor not found"
      });
    }

    // Remove meet from tutorMeets array by _id or meetId
    tutor.tutorMeets = tutor.tutorMeets.filter(
      (meet) => meet._id.toString() !== meetId && meet.meetId !== meetId
    );

    await tutor.save();

    // Also remove from course's liveMeets if exists - search by meetId field
    const courseWithMeet = await courseModel.findOne({ "liveMeets.meetId": meetId });
    if (courseWithMeet) {
      courseWithMeet.liveMeets = courseWithMeet.liveMeets.filter(
        (meet) => meet._id.toString() !== meetId && meet.meetId !== meetId
      );
      await courseWithMeet.save();
    }

    res.json({
      success: true,
      message: "Meet deleted successfully"
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message || "Failed to delete meet"
    });
  }
});

// Update video
router.put("/update-video/:tutorId/:videoId", userAuth, async (req, res) => {
  try {
    const { tutorId, videoId } = req.params;
    const { title } = req.body;

    const tutor = await tutorModel.findById(tutorId);
    if (!tutor) {
      return res.json({
        success: false,
        message: "Tutor not found"
      });
    }

    // Find and update video
    const videoIndex = tutor.tutorVideos.findIndex(
      (video) => video._id.toString() === videoId || video.videoId === videoId
    );

    if (videoIndex === -1) {
      return res.json({
        success: false,
        message: "Video not found"
      });
    }

    tutor.tutorVideos[videoIndex].title = title || tutor.tutorVideos[videoIndex].title;
    await tutor.save();

    res.json({
      success: true,
      message: "Video updated successfully",
      video: tutor.tutorVideos[videoIndex]
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message || "Failed to update video"
    });
  }
});

// Update meet
router.put("/update-meet/:tutorId/:meetId", userAuth, async (req, res) => {
  try {
    const { tutorId, meetId } = req.params;
    const { title, meetLink, meetTime } = req.body;

    const tutor = await tutorModel.findById(tutorId);
    if (!tutor) {
      return res.json({
        success: false,
        message: "Tutor not found"
      });
    }

    // Find and update meet
    const meetIndex = tutor.tutorMeets.findIndex(
      (meet) => meet._id.toString() === meetId || meet.meetId === meetId
    );

    if (meetIndex === -1) {
      return res.json({
        success: false,
        message: "Meet not found"
      });
    }

    tutor.tutorMeets[meetIndex].title = title || tutor.tutorMeets[meetIndex].title;
    tutor.tutorMeets[meetIndex].meetLink = meetLink || tutor.tutorMeets[meetIndex].meetLink;
    if (meetTime) {
      tutor.tutorMeets[meetIndex].meetDate = new Date(meetTime);
      tutor.tutorMeets[meetIndex].meetTime = meetTime;
    }
    
    await tutor.save();

    // Also update in course's liveMeets
    const courseWithMeet = await courseModel.findOne({ "liveMeets.meetId": meetId });
    if (courseWithMeet) {
      const courseVMeetIndex = courseWithMeet.liveMeets.findIndex(
        (meet) => meet._id.toString() === meetId || meet.meetId === meetId
      );
      if (courseVMeetIndex !== -1) {
        courseWithMeet.liveMeets[courseVMeetIndex].title = title || courseWithMeet.liveMeets[courseVMeetIndex].title;
        courseWithMeet.liveMeets[courseVMeetIndex].meetLink = meetLink || courseWithMeet.liveMeets[courseVMeetIndex].meetLink;
        if (meetTime) {
          courseWithMeet.liveMeets[courseVMeetIndex].meetTime = new Date(meetTime);
        }
        await courseWithMeet.save();
      }
    }

    res.json({
      success: true,
      message: "Meet updated successfully",
      meet: tutor.tutorMeets[meetIndex]
    });

  } catch (error) {
    res.json({
      success: false,
      message: error.message || "Failed to update meet"
    });
  }
});

// Update meet status only (for quick status changes)
router.put("/update-meet-status/:tutorId/:meetId", userAuth, async (req, res) => {
  try {
    const { tutorId, meetId } = req.params;
    const { status } = req.body;

    console.log('Status update request:', { tutorId, meetId, status });

    if (!status || !['scheduled', 'live', 'completed'].includes(status)) {
      return res.json({
        success: false,
        message: "Valid status required: scheduled, live, or completed"
      });
    }

    const tutor = await tutorModel.findById(tutorId);
    if (!tutor) {
      console.log('Tutor not found:', tutorId);
      return res.json({
        success: false,
        message: "Tutor not found"
      });
    }

    // Find and update meet status in tutor's tutorMeets array
    const meetIndex = tutor.tutorMeets.findIndex(
      (meet) => meet._id.toString() === meetId || meet.meetId === meetId
    );

    console.log('Meet index found:', meetIndex);

    if (meetIndex === -1) {
      console.log('Meet not found in tutorMeets for meetId:', meetId);
      return res.json({
        success: false,
        message: "Meet not found"
      });
    }

    console.log('Updating tutor meet status from', tutor.tutorMeets[meetIndex].status, 'to', status);
    tutor.tutorMeets[meetIndex].status = status;
    const updatedTutor = await tutor.save();
    console.log('Tutor saved successfully');

    // Also update in course's liveMeets - search by meetId field
    console.log('Searching for course with meetId:', meetId);
    const courseWithMeet = await courseModel.findOne({ "liveMeets.meetId": meetId });
    if (courseWithMeet) {
      const courseMeetIndex = courseWithMeet.liveMeets.findIndex(
        (meet) => meet._id.toString() === meetId || meet.meetId === meetId
      );
      console.log('Course meet index found:', courseMeetIndex);
      if (courseMeetIndex !== -1) {
        console.log('Updating course meet status to', status);
        courseWithMeet.liveMeets[courseMeetIndex].status = status;
        await courseWithMeet.save();
        console.log('Course saved successfully');
      }
    }

    res.json({
      success: true,
      message: `Meet status updated to ${status}`,
      meet: updatedTutor.tutorMeets[meetIndex]
    });

  } catch (error) {
    console.error("Error updating meet status:", error);
    res.json({
      success: false,
      message: error.message || "Failed to update meet status"
    });
  }
});

export default router;
