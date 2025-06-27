const AssignmentModel = require("../models/AssignmentsModel");
const ClassService = require("./ClassService");
const UserService = require("./userService");

class AssignmentService {
  async createAssignment(teacherId, assignmentData) {
    const { classId, title, description, dueDate } = assignmentData;
    if (!classId || !title || !description || !dueDate) {
      throw new Error(
        "Class ID, title, description, and due date are required to create an assignment."
      );
    }

    const teacher = await UserService.findById(teacherId);
    if (!teacher) {
      throw new Error("Teacher not found.");
    }
    const { id, ...rest } = assignmentData; // Loại bỏ trường id nếu có
    const data = { ...rest, teacherId: teacherId };
    return await AssignmentModel.create(data);
  }

  async getAssignments(config) {
    if (!config) throw new Error("Config is required");

    let queryObj = {};
    let user;

    if (config.authId) {
      user = await UserService.findByAuthId(config.authId);
      if (!user) throw new Error("User not found");
    }

    let filterStudentId = null;

    switch (config.action) {
      case "getByTeacherId":
        if (!user) throw new Error("User not found");
        queryObj.teacherId = user._id;
        break;
      case "getByStudentId":
        if (!user) throw new Error("User not found");
        const classData = await ClassService.getClassForStudent(config.authId);
        if (
          !classData ||
          (Array.isArray(classData.data) && classData.data.length === 0)
        ) {
          throw new Error("Class not found for this student");
        }
        const classIds = Array.isArray(classData.data)
          ? classData.data.map((cls) => cls._id)
          : [classData.data._id];
        queryObj.classId = { $in: classIds };
        filterStudentId = user._id.toString();
        queryObj.status = "published";
        break;
      case "getByClassId":
        queryObj.classId = config.classId;
        break;
      case "getByAssignmentId":
        queryObj._id = config.assignmentId;
        break;
      default:
        break;
    }

    if (config.searchTerm) {
      queryObj.title = { $regex: config.searchTerm, $options: "i" };
    }

    const page = parseInt(config.page, 10) > 0 ? parseInt(config.page, 10) : 1;
    const pageSize =
      parseInt(config.pageSize, 10) > 0 ? parseInt(config.pageSize, 10) : 10;

    let query = AssignmentModel.find(queryObj)
      .sort(
        config.sortBy
          ? {
              dueDate: { dueDate: -1 },
              title: { title: 1 },
              submissions: { "submissions.length": -1 },
            }[config.sortBy] || { dueDate: -1 }
          : { dueDate: -1 }
      )
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .populate("teacherId")
      .populate("classId")
      .populate("submissions.studentId");

    const total = await AssignmentModel.countDocuments(queryObj);
    let data = await query.exec();

    // Nếu là getByStudentId thì chỉ giữ lại submission của học viên đó
    if (config.action === "getByStudentId" && filterStudentId) {
      data = data.map((assignment) => {
        const filteredSubmissions = assignment.submissions.filter(
          (sub) =>
            sub.studentId && sub.studentId._id.toString() === filterStudentId
        );
        // Trả về assignment với chỉ submission của học viên này
        return {
          ...assignment.toObject(),
          submissions: filteredSubmissions,
        };
      });
    }

    return {
      data,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  async updateAssignment(id, updateData, config) {
    const assignment = await AssignmentModel.findById(id);
    if (!assignment) throw new Error("Assignment not found");
    if (config?.authId && assignment.teacherId.authId !== config.authId) {
      throw new Error("Unauthorized access.");
    }
    return await AssignmentModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });
  }

  async deleteAssignment(id, config) {
    const assignment = await AssignmentModel.findById(id);
    if (!assignment) throw new Error("Assignment not found");
    if (config?.authId && assignment.teacherId.authId !== config.authId) {
      throw new Error("Unauthorized access.");
    }
    return await AssignmentModel.findByIdAndDelete(id);
  }

  async submitAssignment(assignmentId, submissionData) {
    if (!submissionData || !submissionData.studentId) {
      throw new Error("assignmentId and studentId are required.");
    }

    // Kiểm tra đã nộp chưa
    const assignment = await AssignmentModel.findById(assignmentId);
    if (!assignment) throw new Error("Assignment not found.");

    const existedIndex = assignment.submissions.findIndex(
      (sub) => sub.studentId.toString() === submissionData.studentId.toString()
    );

    let updatedAssignment;
    if (existedIndex !== -1) {
      // Đã nộp, update nội dung và thời gian nộp
      assignment.submissions[existedIndex].link = submissionData.link;
      assignment.submissions[existedIndex].submissionDate = new Date();
      if (submissionData.comments !== undefined)
        assignment.submissions[existedIndex].comments = submissionData.comments;
      updatedAssignment = await assignment.save();
    } else {
      // Chưa nộp, push mới
      assignment.submissions.push({
        studentId: submissionData.studentId,
        link: submissionData.link,
        comments: submissionData.comments || "",
        submissionDate: new Date(),
      });
      updatedAssignment = await assignment.save();
    }

    // Populate kết quả trả về
    return await AssignmentModel.findById(updatedAssignment._id)
      .populate("teacherId")
      .populate("classId")
      .populate("submissions.studentId");
  }
}

module.exports = new AssignmentService();
