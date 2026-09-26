/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Language } from '../types';

export interface TranslationStrings {
  appName: string;
  tagline: string;
  sihBadge: string;
  
  // Navigation
  home: string;
  dashboard: string;
  newAssessment: string;
  history: string;
  reports: string;
  procurementCentre: string;
  settings: string;
  
  // Landing Page
  heroHeading: string;
  heroSubheading: string;
  startAssessment: string;
  workflowHeading: string;
  step1Title: string;
  step1Desc: string;
  step2Title: string;
  step2Desc: string;
  step3Title: string;
  step3Desc: string;
  step4Title: string;
  step4Desc: string;
  step5Title: string;
  step5Desc: string;

  // Problem context
  problemStatementTitle: string;
  problemStatementDesc: string;

  // Dashboard
  recentAssessments: string;
  totalBatches: string;
  reportsGenerated: string;
  avgQuality: string;
  newBatchCTA: string;
  quickStats: string;
  noAssessmentsYet: string;

  // Batch Form
  createBatchTitle: string;
  createBatchSubtitle: string;
  batchId: string;
  procurementCentreLabel: string;
  inspectorName: string;
  inspectionDate: string;
  onionVariety: string;
  approxQuantity: string;
  proceedToImage: string;
  quantityHint: string;

  // Image Input & Capture
  stepIndicator: string;
  uploadTitle: string;
  uploadSubtitle: string;
  uploadImageCTA: string;
  takePictureCTA: string;
  capturePhoto: string;
  retakePhoto: string;
  switchCamera: string;
  dragDropText: string;
  previewTitle: string;
  analyzeButton: string;
  analyzingOnion: string;
  clearImages: string;
  remove: string;
  cameraPermissionDenied: string;
  cameraNotSupported: string;
  cameraActive: string;
  stopCamera: string;

  // Classification Results
  healthy: string;
  unhealthy: string;
  healthyDetails: string;
  unhealthyDetails: string;
  qualityAnalysisTitle: string;
  mainAssessmentResult: string;
  modelConfidence: string;
  detailsTitle: string;
  qualityInterpretation: string;
  recommendation: string;
  suitableStorage: string;
  separateProduce: string;
  goodQuality: string;
  spoilageDetected: string;
  lowConfidenceWarning: string;
  totalOnionsAnalyzed: string;
  generateReportCTA: string;
  reanalyzeCTA: string;

  // Detailed 8 Class Labels (Display Only)
  classRedHealthySingle: string;
  classWhiteHealthySingle: string;
  classRedHealthyBulk: string;
  classWhiteHealthyBulk: string;
  classRedRottenSingle: string;
  classWhiteRottenSingle: string;
  classRedRottenBulk: string;
  classWhiteRottenBulk: string;

  // Digital Report
  reportTitle: string;
  dateTime: string;
  assessmentSummary: string;
  downloadReport: string;
  printReport: string;
  backToDashboard: string;
  gradeA: string;
  gradeURS: string;

  // History & Procurement
  historyTitle: string;
  historySubtitle: string;
  searchPlaceholder: string;
  filterAll: string;
  filterGradeAHigh: string;
  filterURS: string;
  reportIdLabel: string;
  clearAllHistory: string;
  viewReport: string;
  deleteRecord: string;
  clearHistory: string;
  procurementTitle: string;
  procurementSubtitle: string;
  completedBatches: string;
  prototypeDataNotice: string;
  todayAssessments: string;
  pendingAssessments: string;
  disputeNotice: string;

  // Settings
  settingsTitle: string;
  languageSetting: string;
  gradingRulesTitle: string;
  gradeAMinHealthy: string;
  maxPermissibleDamage: string;
  saveSettings: string;
  clearDataButton: string;
  resetDefaults: string;

  // Errors
  errorNoImages: string;
  errorInvalidImage: string;
  modelUnavailableTitle: string;
  modelUnavailableMessage: string;
}

const en: TranslationStrings = {
  appName: "OnionGuard AI",
  tagline: "AI-Assisted Onion Quality Assessment & Grading",
  sihBadge: "SIH 2026 Problem SIH26031",

  home: "Home",
  dashboard: "Dashboard",
  newAssessment: "New Assessment",
  history: "History",
  reports: "Reports",
  procurementCentre: "Procurement Centre",
  settings: "Settings",

  heroHeading: "Smart Onion Quality Assessment",
  heroSubheading: "AI-assisted image analysis for faster, more consistent and transparent onion quality assessment.",
  startAssessment: "Start Onion Assessment",
  workflowHeading: "Digital Inspection Workflow",
  step1Title: "Provide Image",
  step1Desc: "Upload an onion photo or take a picture using your device camera.",
  step2Title: "AI Model Analysis",
  step2Desc: "Trained neural network processes the specimen and classifies into 8 classes.",
  step3Title: "Healthy / Unhealthy Result",
  step3Desc: "Calculates combined Healthy % and Unhealthy % probabilities.",
  step4Title: "Detailed Breakdown",
  step4Desc: "Displays the 8 model class probabilities for transparent explainability.",
  step5Title: "Digital Report",
  step5Desc: "Generates an instant, verifiable digital certificate for procurement records.",

  problemStatementTitle: "The Agricultural Challenge (SIH26031)",
  problemStatementDesc: "Quality assessment and grading of onions are often subjective and vary across procurement centers, resulting in disputes and inconsistencies. OnionGuard AI introduces an objective digital standard to safeguard farmers and procurement agencies.",

  recentAssessments: "Recent Assessments",
  totalBatches: "Total Batches",
  reportsGenerated: "Reports Generated",
  avgQuality: "Average Healthy %",
  newBatchCTA: "+ New Assessment",
  quickStats: "Quick Performance Overview",
  noAssessmentsYet: "No assessments completed yet. Start your first onion assessment!",

  createBatchTitle: "New Onion Assessment",
  createBatchSubtitle: "Enter consignment details before capturing or uploading onion photos.",
  batchId: "Batch ID",
  procurementCentreLabel: "Procurement Centre",
  inspectorName: "Inspector Name",
  inspectionDate: "Inspection Date",
  onionVariety: "Onion Variety",
  approxQuantity: "Approximate Batch Quantity",
  proceedToImage: "Proceed to Image Input",
  quantityHint: "e.g. 50 Quintals / 500 Bags",

  stepIndicator: "Step 1 of 2 — Provide Onion Image",
  uploadTitle: "Provide Onion Image",
  uploadSubtitle: "Select an image from your device or use your camera to take a real-time photo.",
  uploadImageCTA: "Upload Image",
  takePictureCTA: "Take Picture / Use Camera",
  capturePhoto: "Capture Photo",
  retakePhoto: "Retake Photo",
  switchCamera: "Switch Camera",
  dragDropText: "Drag & drop an onion image here or click to browse",
  previewTitle: "Selected Image Preview",
  analyzeButton: "Analyze Onion",
  analyzingOnion: "Analyzing onion...",
  clearImages: "Clear Image",
  remove: "Remove",
  cameraPermissionDenied: "Camera access was denied or is unavailable. Please grant camera permission or use 'Upload Image' to choose a photo.",
  cameraNotSupported: "Camera is not supported on this browser or device. Please upload an image file instead.",
  cameraActive: "Live Camera Viewfinder",
  stopCamera: "Close Camera",

  healthy: "HEALTHY",
  unhealthy: "UNHEALTHY",
  healthyDetails: "Healthy Details",
  unhealthyDetails: "Unhealthy Details",
  qualityAnalysisTitle: "Onion Quality Assessment",
  mainAssessmentResult: "Main Result",
  modelConfidence: "Combined Confidence",
  detailsTitle: "Details: 8 Model Class Probabilities",
  qualityInterpretation: "Quality",
  recommendation: "Recommendation",
  suitableStorage: "Suitable for normal storage, distribution, and commercial sale.",
  separateProduce: "Separate this onion from healthy produce and inspect the batch.",
  goodQuality: "Good quality onion with sound skin and no detected rot.",
  spoilageDetected: "Possible spoilage / rot detected.",
  lowConfidenceWarning: "Low confidence — please capture a clearer image of a single onion.",
  totalOnionsAnalyzed: "Total Images Analyzed",
  generateReportCTA: "Generate Quality Report",
  reanalyzeCTA: "Analyze Another Image",

  classRedHealthySingle: "Red Healthy — Single",
  classWhiteHealthySingle: "White Healthy — Single",
  classRedHealthyBulk: "Red Healthy — Bulk",
  classWhiteHealthyBulk: "White Healthy — Bulk",
  classRedRottenSingle: "Red Rotten — Single",
  classWhiteRottenSingle: "White Rotten — Single",
  classRedRottenBulk: "Red Rotten — Bulk",
  classWhiteRottenBulk: "White Rotten — Bulk",

  reportTitle: "ONION QUALITY ASSESSMENT REPORT",
  dateTime: "Date & Time",
  assessmentSummary: "Assessment Summary",
  downloadReport: "Download Report (JSON)",
  printReport: "Print / Save PDF",
  backToDashboard: "Back to Dashboard",
  gradeA: "Healthy (Grade A)",
  gradeURS: "Unhealthy (URS)",

  historyTitle: "Assessment History",
  historySubtitle: "Review previously audited onion consignments stored in local browser storage.",
  searchPlaceholder: "Search by Batch ID, Centre, or Inspector...",
  filterAll: "All Batches",
  filterGradeAHigh: "Healthy (Grade A)",
  filterURS: "Unhealthy (Rotten)",
  reportIdLabel: "Report ID",
  clearAllHistory: "Clear All History",
  viewReport: "View Report",
  deleteRecord: "Delete",
  clearHistory: "Clear History",
  procurementTitle: "Procurement Centre Dashboard",
  procurementSubtitle: "Intake tracking and quality consistency metrics.",
  completedBatches: "Completed Batches",
  prototypeDataNotice: "Production Intake Quality",
  todayAssessments: "Today's Assessments",
  pendingAssessments: "Pending Reviews",
  disputeNotice: "OnionGuard AI generates tamper-evident digital reports directly from real onion photographs, establishing transparency between farmers and procurement authorities.",

  settingsTitle: "System Settings & Configuration",
  languageSetting: "Interface Language",
  gradingRulesTitle: "Grading Rule Thresholds",
  gradeAMinHealthy: "Minimum Healthy % for Grade A",
  maxPermissibleDamage: "Maximum Permissible Spoilage %",
  saveSettings: "Save Configuration",
  clearDataButton: "Clear Stored Assessments",
  resetDefaults: "Reset to Default Rules",

  errorNoImages: "Please upload or capture an onion image before analyzing.",
  errorInvalidImage: "Please select a valid image file (JPG, PNG, or WEBP).",
  modelUnavailableTitle: "AI Model Not Available",
  modelUnavailableMessage: "Unable to perform reliable AI quality assessment because the trained onion model is not currently connected.",
};

const hi: TranslationStrings = {
  ...en,
  appName: "अनियनगार्ड एआई",
  tagline: "एआई-सहायक प्याज गुणवत्ता मूल्यांकन एवं ग्रेडिंग",
  sihBadge: "एसआईएच 2026 समस्या SIH26031",

  home: "होम",
  dashboard: "डैशबोर्ड",
  newAssessment: "नया मूल्यांकन",
  history: "इतिहास",
  reports: "रिपोर्ट्स",
  procurementCentre: "खरीद केंद्र",
  settings: "सेटिंग्स",

  heroHeading: "सटीक प्याज गुणवत्ता मूल्यांकन",
  heroSubheading: "त्वरित, सुसंगत और पारदर्शी प्याज गुणवत्ता विश्लेषण हेतु एआई-सहायक प्रणाली।",
  startAssessment: "प्याज मूल्यांकन शुरू करें",
  workflowHeading: "डिजिटल निरीक्षण प्रक्रिया",
  step1Title: "तस्वीर प्रदान करें",
  step1Desc: "डिवाइस से फोटो अपलोड करें या कैमरे से तुरंत तस्वीर लें।",
  step2Title: "एआई मॉडल विश्लेषण",
  step2Desc: "प्रशिक्षित न्यूरल नेटवर्क नमूने का 8 श्रेणियों में विश्लेषण करता है।",
  step3Title: "स्वस्थ / अस्वस्थ परिणाम",
  step3Desc: "संयुक्त स्वस्थ % और अस्वस्थ % की सटीक गणना।",
  step4Title: "विस्तृत विवरण",
  step4Desc: "पारदर्शिता हेतु सभी 8 मॉडल श्रेणियों के प्रतिशत प्रदर्शित करता है।",
  step5Title: "डिजिटल रिपोर्ट",
  step5Desc: "खरीद रिकॉर्ड हेतु तत्काल डिजिटल गुणवत्ता प्रमाण पत्र।",

  recentAssessments: "हाल के मूल्यांकन",
  totalBatches: "कुल बैच",
  reportsGenerated: "जारी रिपोर्ट",
  avgQuality: "औसत स्वस्थ %",
  newBatchCTA: "+ नया मूल्यांकन",
  noAssessmentsYet: "अभी तक कोई मूल्यांकन नहीं हुआ है। पहला प्याज मूल्यांकन शुरू करें!",

  createBatchTitle: "नया प्याज मूल्यांकन",
  createBatchSubtitle: "फोटो लेने या अपलोड करने से पहले खेप का विवरण दर्ज करें।",
  batchId: "बैच आईडी",
  procurementCentreLabel: "खरीद केंद्र",
  inspectorName: "निरीक्षक का नाम",
  inspectionDate: "निरीक्षण तिथि",
  onionVariety: "प्याज की किस्म",
  approxQuantity: "अनुमानित मात्रा",
  proceedToImage: "तस्वीर इनपुट पर जाएं",

  stepIndicator: "चरण 1 / 2 — प्याज की तस्वीर दें",
  uploadTitle: "प्याज की तस्वीर प्रदान करें",
  uploadSubtitle: "डिवाइस से फोटो चुनें या कैमरे से सीधी तस्वीर लें।",
  uploadImageCTA: "तस्वीर अपलोड करें",
  takePictureCTA: "तस्वीर लें / कैमरा खोलें",
  capturePhoto: "तस्वीर खींचे",
  retakePhoto: "पुनः तस्वीर लें",
  switchCamera: "कैमरा बदलें",
  dragDropText: "प्याज की फोटो यहाँ खींचें या ब्राउज़ करने के लिए क्लिक करें",
  previewTitle: "चयनित तस्वीर का पूर्वावलोकन",
  analyzeButton: "प्याज का विश्लेषण करें",
  analyzingOnion: "प्याज का विश्लेषण हो रहा है...",
  clearImages: "तस्वीर हटाएं",
  remove: "हटाएं",
  cameraPermissionDenied: "कैमरा अनुमति अस्वीकार कर दी गई है। कृपया अनुमति दें या 'तस्वीर अपलोड करें' का उपयोग करें।",
  cameraNotSupported: "इस डिवाइस या ब्राउज़र पर कैमरा समर्थित नहीं है। कृपया फोटो अपलोड करें।",
  cameraActive: "लाइव कैमरा व्यूफाइंडर",
  stopCamera: "कैमरा बंद करें",

  healthy: "स्वस्थ (HEALTHY)",
  unhealthy: "अस्वस्थ (UNHEALTHY)",
  healthyDetails: "स्वस्थ विवरण",
  unhealthyDetails: "अस्वस्थ विवरण",
  qualityAnalysisTitle: "प्याज गुणवत्ता मूल्यांकन परिणाम",
  mainAssessmentResult: "मुख्य परिणाम",
  modelConfidence: "संयुक्त विश्वसनीयता",
  detailsTitle: "विवरण: 8 मॉडल श्रेणियों की संभावनाएं",
  qualityInterpretation: "गुणवत्ता",
  recommendation: "सिफारिश",
  suitableStorage: "सामान्य भंडारण, वितरण और बाजार बिक्री के लिए उपयुक्त।",
  separateProduce: "इस प्याज को स्वस्थ उपज से अलग करें और बैच की जांच करें।",
  goodQuality: "अच्छी गुणवत्ता वाला प्याज, कोई सड़न नहीं पाई गई।",
  spoilageDetected: "संभावित सड़न / खराबी पाई गई।",
  lowConfidenceWarning: "कम विश्वसनीयता — कृपया एकल प्याज की अधिक स्पष्ट तस्वीर लें।",
  totalOnionsAnalyzed: "कुल जांची गई तस्वीरें",
  generateReportCTA: "गुणवत्ता रिपोर्ट बनाएं",
  reanalyzeCTA: "अन्य तस्वीर जांचें",

  classRedHealthySingle: "लाल स्वस्थ — एकल",
  classWhiteHealthySingle: "सफेद स्वस्थ — एकल",
  classRedHealthyBulk: "लाल स्वस्थ — थोक",
  classWhiteHealthyBulk: "सफेद स्वस्थ — थोक",
  classRedRottenSingle: "लाल सड़ा हुआ — एकल",
  classWhiteRottenSingle: "सफेद सड़ा हुआ — एकल",
  classRedRottenBulk: "लाल सड़ा हुआ — थोक",
  classWhiteRottenBulk: "सफेद सड़ा हुआ — थोक",

  reportTitle: "प्याज गुणवत्ता मूल्यांकन रिपोर्ट",
  dateTime: "दिनांक एवं समय",
  assessmentSummary: "मूल्यांकन सारांश",
  downloadReport: "रिपोर्ट डाउनलोड करें (JSON)",
  printReport: "प्रिंट / PDF सुरक्षित करें",
  backToDashboard: "डैशबोर्ड पर वापस जाएं",
  gradeA: "स्वस्थ (ग्रेड ए)",
  gradeURS: "अस्वस्थ (कटौती)",

  historyTitle: "मूल्यांकन इतिहास",
  historySubtitle: "स्थानीय ब्राउज़र में सहेजे गए पूर्व प्याज बैचों की समीक्षा करें।",
  searchPlaceholder: "बैच आईडी, केंद्र या निरीक्षक द्वारा खोजें...",
  filterAll: "सभी बैच",
  viewReport: "रिपोर्ट देखें",
  deleteRecord: "हटाएं",
  clearHistory: "इतिहास साफ करें",

  settingsTitle: "सिस्टम सेटिंग्स",
  languageSetting: "इंटरफ़ेस भाषा",
  gradingRulesTitle: "ग्रेडिंग नियम सीमाएं",
  saveSettings: "सेटिंग्स सुरक्षित करें",
  clearDataButton: "सहेजे गए मूल्यांकन हटाएं",

  errorNoImages: "विश्लेषण करने से पहले कृपया प्याज की तस्वीर अपलोड करें या खींचें।",
  errorInvalidImage: "कृपया एक वैध तस्वीर चुनें (JPG, PNG, या WEBP)।",
  modelUnavailableTitle: "एआई मॉडल उपलब्ध नहीं है",
  modelUnavailableMessage: "विश्वसनीय एआई मूल्यांकन नहीं हो सकता क्योंकि प्रशिक्षित प्याज मॉडल कनेक्ट नहीं है।",
};

const bn: TranslationStrings = {
  ...en,
  appName: "অনিয়নগার্ড এআই",
  tagline: "এআই-সহায়তায় পেঁয়াজের গুণমান মূল্যায়ন ও গ্রেডিং",
  home: "হোম",
  dashboard: "ড্যাশবোর্ড",
  newAssessment: "নতুন মূল্যায়ন",
  history: "ইতিহাস",
  reports: "রিপোর্ট",
  procurementCentre: "সংগ্রহ কেন্দ্র",
  settings: "সেটিংস",
  heroHeading: "স্মার্ট পেঁয়াজ গুণমান মূল্যায়ন",
  heroSubheading: "দ্রুত, নির্ভরযোগ্য ও স্বচ্ছ পেঁয়াজ মূল্যায়নের জন্য আধুনিক এআই ব্যবস্থা।",
  startAssessment: "মূল্যায়ন শুরু করুন",
  uploadImageCTA: "ছবি আপলোড করুন",
  takePictureCTA: "ছবি তুলুন / ক্যামেরা",
  capturePhoto: "ছবি তুলুন",
  retakePhoto: "পুনরায় তুলুন",
  previewTitle: "নির্বাচিত ছবির প্রিভিউ",
  analyzeButton: "পেঁয়াজ বিশ্লেষণ করুন",
  analyzingOnion: "পেঁয়াজ বিশ্লেষণ করা হচ্ছে...",
  healthy: "স্বাস্থ্যকর (HEALTHY)",
  unhealthy: "অস্বাস্থ্যকর (UNHEALTHY)",
  healthyDetails: "স্বাস্থ্যকর বিবরণ",
  unhealthyDetails: "অস্বাস্থ্যকর বিবরণ",
  qualityAnalysisTitle: "গুণমান মূল্যায়ন ফলাফল",
  mainAssessmentResult: "মূল ফলাফল",
  detailsTitle: "বিবরণ: ৮টি মডেল শ্রেণীর সম্ভাবনা",
  qualityInterpretation: "গুণমান",
  recommendation: "পরামর্শ",
  suitableStorage: "স্বাভাবিক সংরক্ষণ ও বিক্রির জন্য উপযুক্ত।",
  separateProduce: "এই পেঁয়াজটি আলাদা করুন এবং পুরো ব্যাচ পরীক্ষা করুন।",
  generateReportCTA: "রিপোর্ট তৈরি করুন",
  reanalyzeCTA: "আরেকটি ছবি বিশ্লেষণ করুন",
  errorNoImages: "বিশ্লেষণ করার আগে একটি পেঁয়াজের ছবি দিন।",
};

const mr: TranslationStrings = {
  ...en,
  appName: "अनियनगार्ड एआय",
  tagline: "कांदा गुणवत्ता मूल्यांकन आणि प्रतवारी प्रणाली",
  home: "मुख्यपृष्ठ",
  dashboard: "डॅशबोर्ड",
  newAssessment: "नवीन तपासणी",
  history: "इतिहास",
  reports: "अहवाल",
  procurementCentre: "खरेदी केंद्र",
  settings: "सेटिंग्ज",
  heroHeading: "कांदा गुणवत्ता अचूक मूल्यांकन",
  heroSubheading: "कांदा गुणवत्तेच्या जलद, पारदर्शक आणि वस्तुनिष्ठ मूल्यांकनासाठी एआय प्रणाली.",
  startAssessment: "कांदा तपासणी सुरू करा",
  uploadImageCTA: "फोटो अपलोड करा",
  takePictureCTA: "फोटो काढा / कॅमेरा",
  capturePhoto: "फोटो घ्या",
  retakePhoto: "पुन्हा फोटो घ्या",
  previewTitle: "निवडलेला फोटो",
  analyzeButton: "कांदा विश्लेषण करा",
  analyzingOnion: "कांद्याचे विश्लेषण सुरू आहे...",
  healthy: "चांगला / निरोगी (HEALTHY)",
  unhealthy: "खराब / नासका (UNHEALTHY)",
  healthyDetails: "चांगल्या कांद्याचा तपशील",
  unhealthyDetails: "खराब कांद्याचा तपशील",
  qualityAnalysisTitle: "गुणवत्ता मूल्यांकन निकाल",
  mainAssessmentResult: "मुख्य निकाल",
  detailsTitle: "तपशील: ८ मॉडेल वर्ग संभाव्यता",
  qualityInterpretation: "गुणवत्ता",
  recommendation: "शिफारस",
  suitableStorage: "सामान्य साठवणूक आणि बाजारात विक्रीसाठी योग्य.",
  separateProduce: "हा कांदा चांगल्या कांद्यांपासून वेगळा करा.",
  generateReportCTA: "गुणवत्ता अहवाल तयार करा",
  reanalyzeCTA: "दुसऱ्या फोटोचे विश्लेषण करा",
  errorNoImages: "कृपया विश्लेषणासाठी कांद्याचा फोटो निवडा किंवा काढा.",
};

const te: TranslationStrings = {
  ...en,
  appName: "ఆనియన్‌గార్డ్ AI",
  tagline: "ఉల్లిపాయ నాణ్యత పరిశీలన మరియు గ్రేడింగ్",
  home: "హోమ్",
  dashboard: "డ్యాష్‌బోర్డ్",
  newAssessment: "కొత్త పరిశీలన",
  history: "చరిత్ర",
  reports: "నివేదికలు",
  procurementCentre: "సేకరణ కేంద్రం",
  settings: "సెట్టింగులు",
  heroHeading: "ఉల్లిపాయ నాణ్యత డిజిటల్ పరిశీలన",
  heroSubheading: "వేగవంతమైన మరియు పారదర్శక నాణ్యత పరిశీలన కోసం AI సాంకేతికత.",
  startAssessment: "పరిశీలన ప్రారంభించండి",
  uploadImageCTA: "ఫోటో అప్‌లోడ్ చేయండి",
  takePictureCTA: "ఫోటో తీయండి / కెమెరా",
  capturePhoto: "ఫోటో తీయండి",
  retakePhoto: "మళ్ళీ తీయండి",
  previewTitle: "ఎంచుకున్న ఫోటో ప్రివ్యూ",
  analyzeButton: "విశ్లేషించండి",
  analyzingOnion: "ఉల్లిపాయను విశ్లేషిస్తోంది...",
  healthy: "ఆరోగ్యకరమైనది (HEALTHY)",
  unhealthy: "పాడైపోయినది (UNHEALTHY)",
  healthyDetails: "మంచి నాణ్యత వివరాలు",
  unhealthyDetails: "పాడైపోయిన వివరాలు",
  qualityAnalysisTitle: "నాణ్యత ఫలితం",
  mainAssessmentResult: "ప్రధాన ఫలితం",
  detailsTitle: "వివరాలు: 8 వర్గాల సంభావ్యత",
  qualityInterpretation: "నాణ్యత",
  recommendation: "సిఫార్సు",
  suitableStorage: "సాధారణ నిల్వ మరియు మార్కెట్ విక్రయానికి తగినది.",
  separateProduce: "ఈ ఉల్లిపాయను వేరు చేసి నిల్వను పరిశీలించండి.",
  generateReportCTA: "నివేదికను రూపొందించండి",
  reanalyzeCTA: "మరొక ఫోటోను విశ్లేషించండి",
  errorNoImages: "విశ్లేషించడానికి దయచేసి ఉల్లిపాయ ఫోటోను అందించండి.",
};

const ta: TranslationStrings = {
  ...en,
  appName: "ஆனியன்கார்ட் AI",
  tagline: "வெங்காய தர மதிப்பீடு மற்றும் தரம் பிரித்தல்",
  home: "முகப்பு",
  dashboard: "டாஷ்போர்டு",
  newAssessment: "புதிய மதிப்பீடு",
  history: "வரலாறு",
  reports: "அறிக்கைகள்",
  procurementCentre: "கொள்முதல் மையம்",
  settings: "அமைப்புகள்",
  heroHeading: "வெங்காய தர மதிப்பீட்டு முறை",
  heroSubheading: "விரைவான மற்றும் வெளிப்படையான வெங்காய தர பரிசோதனைக்கான AI தளம்.",
  startAssessment: "மதிப்பீட்டைத் தொடங்கவும்",
  uploadImageCTA: "படம் பதிவேற்றவும்",
  takePictureCTA: "படம் எடுக்கவும் / கேமரா",
  capturePhoto: "படம் எடு",
  retakePhoto: "மீண்டும் எடு",
  previewTitle: "தேர்ந்தெடுக்கப்பட்ட படம்",
  analyzeButton: "வெங்காயத்தை ஆராயுங்கள்",
  analyzingOnion: "வெங்காயம் பகுப்பாய்வு செய்யப்படுகிறது...",
  healthy: "ஆரோக்கியமானது (HEALTHY)",
  unhealthy: "பாதிக்கப்பட்டது (UNHEALTHY)",
  healthyDetails: "நல்ல தர விவரங்கள்",
  unhealthyDetails: "அழுகிய / சேதமடைந்த விவரங்கள்",
  qualityAnalysisTitle: "தர மதிப்பீட்டு முடிவு",
  mainAssessmentResult: "முதன்மை முடிவு",
  detailsTitle: "விவரங்கள்: 8 மாதிரி வகுப்புகளின் விகிதம்",
  qualityInterpretation: "தரம்",
  recommendation: "பரிந்துரை",
  suitableStorage: "வழக்கமான சேமிப்பு மற்றும் விற்பனைக்கு ஏற்றது.",
  separateProduce: "இந்த வெங்காயத்தை தனியாக பிரித்து வைக்கவும்.",
  generateReportCTA: "அறிக்கையை உருவாக்கவும்",
  reanalyzeCTA: "மற்றொரு படத்தை ஆராயுங்கள்",
  errorNoImages: "பகுப்பாய்வு செய்ய வெங்காயப் படத்தை வழங்கவும்.",
};

const kn: TranslationStrings = {
  ...en,
  appName: "ಆನಿಯನ್‌ಗಾರ್ಡ್ AI",
  tagline: "ಈರುಳ್ಳಿ ಗುಣಮಟ್ಟ ಮೌಲ್ಯಮಾಪನ ಮತ್ತು ಗ್ರೇಡಿಂಗ್",
  home: "ಮುಖಪುಟ",
  dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
  newAssessment: "ಹೊಸ ಮೌಲ್ಯಮಾಪನ",
  history: "ಇತಿಹಾಸ",
  reports: "ವರದಿಗಳು",
  procurementCentre: "ಖರೀದಿ ಕೇಂದ್ರ",
  settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
  heroHeading: "ಈರುಳ್ಳಿ ಗುಣಮಟ್ಟ ಮೌಲ್ಯಮಾಪನ",
  heroSubheading: "ನಿಖರ ಮತ್ತು ಪಾರದರ್ಶಕ ಈರುಳ್ಳಿ ಗುಣಮಟ್ಟ ವಿಶ್ಲೇಷಣೆಗಾಗಿ AI ತಂತ್ರಜ್ಞಾನ.",
  startAssessment: "ಮೌಲ್ಯಮಾಪನ ಪ್ರಾರಂಭಿಸಿ",
  uploadImageCTA: "ಚಿತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
  takePictureCTA: "ಫೋಟೋ ತೆಗೆಯಿರಿ / ಕ್ಯಾಮೆರಾ",
  capturePhoto: "ಫೋಟೋ ಸೆರೆಹಿಡಿಯಿರಿ",
  retakePhoto: "ಮತ್ತೆ ತೆಗೆಯಿರಿ",
  previewTitle: "ಆಯ್ಕೆಮಾಡಿದ ಚಿತ್ರದ ಮುನ್ನೋಟ",
  analyzeButton: "ಈರುಳ್ಳಿ ವಿಶ್ಲೇಷಿಸಿ",
  analyzingOnion: "ಈರುಳ್ಳಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
  healthy: "ಆರೋಗ್ಯಕರ (HEALTHY)",
  unhealthy: "ಹಾಳಾದದ್ದು (UNHEALTHY)",
  healthyDetails: "ಆರೋಗ್ಯಕರ ಈರುಳ್ಳಿ ವಿವರಗಳು",
  unhealthyDetails: "ಹಾಳಾದ ಈರುಳ್ಳಿ ವಿವರಗಳು",
  qualityAnalysisTitle: "ಗುಣಮಟ್ಟ ಮೌಲ್ಯಮಾಪನ ಫಲಿತಾಂಶ",
  mainAssessmentResult: "ಮುಖ್ಯ ಫಲಿತಾಂಶ",
  detailsTitle: "ವಿವರಗಳು: 8 ಮಾದರಿ ವರ್ಗಗಳ ಸಂಭವನೀಯತೆ",
  qualityInterpretation: "ಗುಣಮಟ್ಟ",
  recommendation: "ಶಿಫಾರಸು",
  suitableStorage: "ಸಾಮಾನ್ಯ ಸಂಗ್ರಹಣೆ ಮತ್ತು ಮಾರಾಟಕ್ಕೆ ಸೂಕ್ತವಾಗಿದೆ.",
  separateProduce: "ಈ ಈರುಳ್ಳಿಯನ್ನು ಪ್ರತ್ಯೇಕಿಸಿ ಮತ್ತು ಪರೀಕ್ಷಿಸಿ.",
  generateReportCTA: "ಗುಣಮಟ್ಟದ ವರದಿ ರಚಿಸಿ",
  reanalyzeCTA: "ಮತ್ತೊಂದು ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
  errorNoImages: "ವಿಶ್ಲೇಷಿಸಲು ದಯವಿಟ್ಟು ಈರುಳ್ಳಿ ಚಿತ್ರವನ್ನು ಒದಗಿಸಿ.",
};

const gu: TranslationStrings = {
  ...en,
  appName: "ઓનિયનગાર્ડ AI",
  tagline: "ડુંગળી ગુણવત્તા મૂલ્યાંકન અને ગ્રેડિંગ સિસ્ટમ",
  home: "હોમ",
  dashboard: "ડેશબોર્ડ",
  newAssessment: "નવું મૂલ્યાંકન",
  history: "ઇતિહાસ",
  reports: "અહેવાલો",
  procurementCentre: "ખરીદ કેન્દ્ર",
  settings: "સેટિંગ્સ",
  heroHeading: "સ્માર્ટ ડુંગળી ગુણવત્તા મૂલ્યાંકન",
  heroSubheading: "ઝડપી, સુસંગત અને પારદર્શક ડુંગળી ગુણવત્તા પરીક્ષણ માટે AI ટેકનોલોજી.",
  startAssessment: "ડુંગળી પરીક્ષણ શરૂ કરો",
  uploadImageCTA: "ફોટો અપલોડ કરો",
  takePictureCTA: "ફોટો લો / કેમેરા વાપરો",
  capturePhoto: "ફોટો ખેંચો",
  retakePhoto: "ફરીથી લો",
  previewTitle: "પસંદ કરેલ ફોટો પૂર્વાવલોકન",
  analyzeButton: "ડુંગળીનું વિશ્લેષણ કરો",
  analyzingOnion: "ડુંગળીનું વિશ્લેષણ થઈ રહ્યું છે...",
  healthy: "સ્વસ્થ / સારી (HEALTHY)",
  unhealthy: "બગડેલી / ખરાબ (UNHEALTHY)",
  healthyDetails: "સારી ડુંગળીની વિગતો",
  unhealthyDetails: "બગડેલી ડુંગળીની વિગતો",
  qualityAnalysisTitle: "ગુણવત્તા પરિણામ",
  mainAssessmentResult: "મુખ્ય પરિણામ",
  detailsTitle: "વિગતો: 8 મોડેલ વર્ગોની સંભાવના",
  qualityInterpretation: "ગુણવત્તા",
  recommendation: "ભલામણ",
  suitableStorage: "સામાન્ય સંગ્રહ અને બજારમાં વેચાણ માટે યોગ્ય.",
  separateProduce: "આ ડુંગળીને સારી ડુંગળીથી અલગ કરો.",
  generateReportCTA: "ગુણવત્તા રિપોર્ટ બનાવો",
  reanalyzeCTA: "બીજો ફોટો ચકાસો",
  errorNoImages: "વિશ્લેષણ કરવા માટે ડુંગળીનો ફોટો પૂરો પાડો.",
};

export const translations: Record<Language, TranslationStrings> = {
  en,
  hi,
  bn,
  mr,
  te,
  ta,
  kn,
  gu,
};

export const LANGUAGE_LABELS: Record<Language, { native: string; english: string }> = {
  en: { native: "English", english: "English" },
  hi: { native: "हिन्दी", english: "Hindi" },
  bn: { native: "বাংলা", english: "Bengali" },
  mr: { native: "मराठी", english: "Marathi" },
  te: { native: "తెలుగు", english: "Telugu" },
  ta: { native: "தமிழ்", english: "Tamil" },
  kn: { native: "ಕನ್ನಡ", english: "Kannada" },
  gu: { native: "ગુજરાતી", english: "Gujarati" },
};
