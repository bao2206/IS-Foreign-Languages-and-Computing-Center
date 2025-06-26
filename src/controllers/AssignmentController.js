const AssignmentService = require("../services/AssignmentService");

class AssignmentController {
  async createAssignment(req, res) {
    try {
      const { id, data } = req.body;

      const assignment = await AssignmentService.createAssignment(id, data);
      return res.status(201).json({
        message: "Assignment created successfully",
        data: assignment,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        message: "Error creating assignment",
        error: error.message,
      });
    }
  }

  async getAssignmentsByClassId(req, res) {
    try {
      const classId = req.params.classId;
      const assignments = await AssignmentService.getAssignmentsByClassId(
        classId
      );
      return res.status(200).json({
        message: "Assignments retrieved successfully",
        data: assignments,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving assignments",
        error: error.message,
      });
    }
  }

  async getAssignments(req, res) {
    try {
      const assignment = await AssignmentService.getAssignments(req.body);
      if (!assignment) {
        return res.status(404).json({
          message: "Assignment not found",
        });
      }
      return res.status(200).json({
        message: "Assignment retrieved successfully",
        data: assignment,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        message: "Error retrieving assignment",
        error: error.message,
      });
    }
  }
  async updateAssignment(req, res) {
    try {
      const assignmentId = req.params.id;
      const updateData = req.body;

      const updatedAssignment = await AssignmentService.updateAssignment(
        assignmentId,
        updateData
      );
      if (!updatedAssignment) {
        return res.status(404).json({
          message: "Assignment not found",
        });
      }
      return res.status(200).json({
        message: "Assignment updated successfully",
        data: updatedAssignment,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        message: "Error updating assignment",
        error: error.message,
      });
    }
  }

  async deleteAssignment(req, res) {
    try {
      const assignmentId = req.params.id;
      const deletedAssignment = await AssignmentService.deleteAssignment(
        assignmentId
      );
      if (!deletedAssignment) {
        return res.status(404).json({
          message: "Assignment not found",
        });
      }
      return res.status(200).json({
        message: "Assignment deleted successfully",
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        message: "Error deleting assignment",
        error: error.message,
      });
    }
  }

  async submissionAssignment(req, res) {
    try {
      const assignmentId = req.params.id;
      const data = req.body;
      const updatedAssignment = await AssignmentService.submitAssignment(
        assignmentId,
        data
      );
      return res.status(200).json({
        message: "Submission added successfully",
        data: updatedAssignment,
      });
    } catch (error) {
      console.log(error);

      return res.status(500).json({
        message: "Error adding submission",
        error: error.message,
      });
    }
  }
}

module.exports = new AssignmentController();
