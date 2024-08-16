export enum TransactionType {
  DEPOSIT = "DEPOSIT",
  WITHDRAWAL = "WITHDRAWAL",
}

export enum WorkStatus {
  ALL = "ALL",
  PERIOD = "PERIOD",
}

export enum CheckStatus {
  ALLCOMPLETED = "ALLCOMPLETED",
  SOMECOMPLETED = "SOMECOMPLETED",
  NOTCOMPLETED = "NOTCOMPLETED",
  WAITING = "WAITING",
}

export enum QuotationStatus {
  ALL = "ALL",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  INVOICE_DEPOSIT = "INVOICE_DEPOSIT",
  RECEIPT_DEPOSIT = "RECEIPT_DEPOSIT",
  SUBMITTED = "SUBMITTED",
  CUSTOMER_APPROVED = "CUSTOMER_APPROVED",
  CUSTOMER_REJECTED = "CUSTOMER_REJECTED",
  CUSTOMER_REVIEWED = "CUSTOMER_REVIEWED",
  EXPIRED = "EXPIRED",
}

export enum InvoiceStatus {
  ALL = "ALL",
  PENDING = "PENDING",
  BILLED = "BILLED",
  INVOICED = "INVOICED",
}

export enum ReceiptStatus {
  ALL = "ALL",
  PENDING = "PENDING",
  BILLED = "BILLED",
}

export enum SubmissionStatus {
  ALL = "ALL",
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum UserRole {
  OWNER = "OWNER",
  MANAGER = "MANAGER",
  SALES = "SALES",
  SALESMANAGER = "SALESMANAGER",
  EMPLOYEE = "EMPLOYEE",
}

export enum ReviewType {
  PERIODIC = "PERIODIC",
  OVERALL = "OVERALL",
}

export enum WorkerStatus {
  MAINWORKER = "MAINWORKER",
  OUTSOUCRE = "OUTSOUCRE",
}

export enum DiscountType {
  PERCENT = "PERCENT",
  THB = "THB",
  NONE = "NONE",
}

export enum TaxType {
  TAX3 = "TAX3",
  TAX5 = "TAX5",
  NOTAX = "NOTAX",
}

export enum CategoryType {
  ELECTRICIAN = "ELECTRICIAN",
  MASON = "MASON",
  ALUMINUM_WORKER = "ALUMINUM_WORKER",
}

export enum AccountType {
  FREE = "FREE",
  PREMIUM = "PREMIUM",
}

export enum Platform {
  ANDROID = "ANDROID",
  IOS = "IOS",
  WEB = "WEB",
}

export enum SubscriptionStatus {
  ACTIVE = "ACTIVE",
  PAST_DUE = "PAST_DUE",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}
export enum SubscriptionType {
  FREETRIAL = "FREETRIAL",
  ONEMONTH = "ONEMONTH",
  SIXMONTHS = "SIXMONTHS",
  ONEYEAR = "ONEYEAR",
  DEMO = "DEMO",
  EXPIRED = "EXPIRED",
}

export enum SignatureType {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  PENDING = "PENDING",
}

export enum WarrantyStatus {
  ALL = "ALL",
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
}

export enum SocialProvider {
  EMAIL = "EMAIL",
  GOOGLE = "GOOGLE",
  FACEBOOK = "FACEBOOK",
  LINE = "LINE",
  PHONE = "PHONE",
}
export enum NotificationType {
  SubmissionEvent = "SubmissionEvent",
  QuotationEvent = "QuotationEvent",
}

export enum QueryKeyType {
  DASHBOARD = "DASHBOARD",
  RECEIPTS = "RECEIPTS",
  INVOICES = "INVOICES",
  SUBMISSIONS = "SUBMISSIONS",
  QUOTATIONS = "QUOTATIONS",
  WORKERS = "WORKERS",
  COMPANY = "COMPANY",
  SUBSCRIPTION = "SUBSCRIPTION",
  USER = "USER",
  GALLERY = "GALLERY",
  CATEGORY = "CATEGORY",
  MATERIAL = "MATERIAL",
  STANDARD = "STANDARD",
}