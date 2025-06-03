const rolePermissions = {
    admin: [
      permissions.CREATE_USER,
      permissions.ASSIGN_ROLE,
      permissions.VIEW_FINANCIAL_REPORT,
      permissions.MANAGE_CLASSES
    ],
    parent: [
      permissions.VIEW_SCHEDULE,
      permissions.VIEW_GRADES,
      permissions.MAKE_PAYMENT
    ],
    student: [
      permissions.VIEW_SCHEDULE,
      permissions.VIEW_GRADES
    ],
    teacher: [
      permissions.MANAGE_CLASSES,
      permissions.VIEW_GRADES
    ],
    consultant: [
      permissions.VIEW_SCHEDULE
    ],
    academic_finance_staff: [
      permissions.VIEW_FINANCIAL_REPORT,
      permissions.MANAGE_CLASSES
    ],
    finance: [
      permissions.VIEW_FINANCIAL_REPORT,
      permissions.MANAGE_PAYMENTS,
      permissions.VIEW_PAYMENT_HISTORY,
      permissions.MANAGE_DISCOUNTS
    ]
  };
module.exports = rolePermissions;