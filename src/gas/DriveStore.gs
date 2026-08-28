/**
 * ============================================================================
 * CMMS SIDRAH - DRIVE STORAGE LAYER (DriveStore.gs)
 * Company: شركة سيدره للصناعات الغذائية والحلويات
 * 
 * Manages Google Drive folder structures and file persistence:
 * - Dynamic hierarchy: CMMS / Reports / <WO_ID> / ...
 * - Binary & Base64 decoding/encoding for photos, audio, videos, and PDFs
 * - Public & thumbnail URL generation for seamless preview in CMMS
 * - Google Form file-upload re-organization and sanitization
 * ============================================================================
 */

const DriveStore = (function() {
  
  /**
   * Retrieves or creates a folder inside a parent folder safely
   * @param {string} folderName Target folder name
   * @param {GoogleAppsScript.Drive.Folder|null} parentFolder Optional parent folder (defaults to Drive root)
   * @return {GoogleAppsScript.Drive.Folder}
   */
  function getOrCreateFolder(folderName, parentFolder = null) {
    try {
      const parent = parentFolder || DriveApp.getRootFolder();
      const folders = parent.getFoldersByName(folderName);
      if (folders.hasNext()) {
        return folders.next();
      }
      return parent.createFolder(folderName);
    } catch (err) {
      Logger.log(`DriveStore.getOrCreateFolder error for [${folderName}]: ${err.message}`);
      return DriveApp.getRootFolder();
    }
  }

  /**
   * Returns the root CMMS directory in Google Drive
   * @return {GoogleAppsScript.Drive.Folder}
   */
  function getRootDir() {
    const rootName = (typeof CONFIG !== 'undefined' && CONFIG.ROOT_DRIVE_FOLDER) ? CONFIG.ROOT_DRIVE_FOLDER : 'CMMS';
    return getOrCreateFolder(rootName);
  }

  /**
   * Returns the dedicated folder for a specific Work Order: CMMS / Reports / <WO_ID>
   * @param {string} woId Work Order Identifier (e.g. WO-202608-101)
   * @return {GoogleAppsScript.Drive.Folder}
   */
  function getWorkOrderFolder(woId) {
    const safeWoId = String(woId || 'GENERAL_REPORTS').replace(/[/\\?%*:|"<>]/g, '-');
    const root = getRootDir();
    const reportsDirName = (typeof CONFIG !== 'undefined' && CONFIG.REPORTS_DRIVE_FOLDER) ? CONFIG.REPORTS_DRIVE_FOLDER : 'Reports';
    const reports = getOrCreateFolder(reportsDirName, root);
    return getOrCreateFolder(safeWoId, reports);
  }

  /**
   * Converts any Google Drive file to an accessible preview/direct image URL
   * @param {GoogleAppsScript.Drive.File} file
   * @return {string}
   */
  function getFileViewUrl(file) {
    if (!file) return '';
    try {
      // Grant view permissions with link so web app and dashboard can render images
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      const fileId = file.getId();
      // High performance direct stream link
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    } catch (e) {
      Logger.log(`DriveStore.getFileViewUrl warning: ${e.message}`);
      return file.getUrl();
    }
  }

  /**
   * Extracts Google Drive file ID from various URL formats or raw ID
   * @param {string} fileIdOrUrl
   * @return {string}
   */
  function extractFileId(fileIdOrUrl) {
    if (!fileIdOrUrl) return '';
    let str = String(fileIdOrUrl).trim();
    if (str.includes('id=')) {
      str = str.split('id=')[1].split('&')[0];
    } else if (str.includes('/d/')) {
      str = str.split('/d/')[1].split('/')[0];
    } else if (str.includes('open?id=')) {
      str = str.split('open?id=')[1].split('&')[0];
    }
    return str;
  }

  /**
   * Saves a binary / base64 encoded string into the specified Work Order folder in Drive
   * Supports data URI formats: data:image/jpeg;base64,..., data:audio/mp3;base64,..., data:application/pdf;base64,...
   * 
   * @param {string} woId Work Order ID
   * @param {string} base64Data Base64 payload
   * @param {string} fileName Desired file name (e.g. before_photo.jpg, visit_audio.mp3)
   * @return {string} Public Drive view URL
   */
  function saveBase64File(woId, base64Data, fileName = 'attachment.jpg') {
    if (!base64Data || typeof base64Data !== 'string') return '';
    
    // If it's already an active HTTP/HTTPS link, return as-is
    if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
      return base64Data;
    }

    try {
      let mimeType = 'image/jpeg';
      let rawBase64 = base64Data;

      // Extract MIME type if Data URI scheme is used
      if (base64Data.includes(';base64,')) {
        const parts = base64Data.split(';base64,');
        mimeType = parts[0].replace(/^data:/, '').trim() || 'image/jpeg';
        rawBase64 = parts[1];
      } else if (fileName.endsWith('.png')) {
        mimeType = 'image/png';
      } else if (fileName.endsWith('.mp3') || fileName.endsWith('.m4a') || fileName.endsWith('.wav')) {
        mimeType = 'audio/mp3';
      } else if (fileName.endsWith('.mp4')) {
        mimeType = 'video/mp4';
      } else if (fileName.endsWith('.pdf')) {
        mimeType = 'application/pdf';
      }

      // Decode bytes and create blob
      const decodedBytes = Utilities.base64Decode(rawBase64);
      const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
      
      const targetFolder = getWorkOrderFolder(woId);
      const createdFile = targetFolder.createFile(blob);
      
      Logger.log(`Saved file [${fileName}] (${mimeType}) in WO folder [${woId}], ID: ${createdFile.getId()}`);
      return getFileViewUrl(createdFile);

    } catch (err) {
      Logger.log(`DriveStore.saveBase64File error for ${woId} [${fileName}]: ${err.message}`);
      return '';
    }
  }

  /**
   * Saves a raw binary blob directly into the Work Order folder
   * @param {string} woId Work Order ID
   * @param {GoogleAppsScript.Base.Blob} blob
   * @return {string} Viewable URL
   */
  function saveBlob(woId, blob) {
    if (!blob) return '';
    try {
      const folder = getWorkOrderFolder(woId);
      const file = folder.createFile(blob);
      return getFileViewUrl(file);
    } catch (err) {
      Logger.log(`DriveStore.saveBlob error for ${woId}: ${err.message}`);
      return '';
    }
  }

  /**
   * Moves a file uploaded via Google Form into the designated CMMS folder
   * @param {string} woId Work Order ID
   * @param {string} fileIdOrUrl Drive ID or URL from Google Form answer
   * @param {string} prefix Name prefix (e.g. before, after, visit)
   * @return {string} New drive file link
   */
  function moveFormUploadedFile(woId, fileIdOrUrl, prefix = 'before') {
    if (!fileIdOrUrl) return '';

    try {
      const fileId = extractFileId(fileIdOrUrl);
      const file = DriveApp.getFileById(fileId);
      const targetFolder = getWorkOrderFolder(woId);
      
      // Move file into the structured WO directory
      file.moveTo(targetFolder);
      
      // Prefix file name for standardized records
      const originalName = file.getName();
      file.setName(`${prefix}_${originalName}`);
      
      return getFileViewUrl(file);
    } catch (err) {
      Logger.log(`DriveStore.moveFormUploadedFile error for [${fileIdOrUrl}]: ${err.message}`);
      return fileIdOrUrl; // Fallback to raw string
    }
  }

  /**
   * Fetches a Google Drive file and returns its Base64 string + MIME type
   * Used for passing image and audio multimodal parts to Gemini API
   * 
   * @param {string} driveUrlOrId Direct link or Drive file ID
   * @return {{base64: string, mimeType: string, fileSize: number}|null}
   */
  function getFileAsBase64(driveUrlOrId) {
    if (!driveUrlOrId) return null;

    try {
      const fileId = extractFileId(driveUrlOrId);
      const file = DriveApp.getFileById(fileId);
      const blob = file.getBlob();
      const mimeType = blob.getContentType() || 'image/jpeg';
      const bytes = blob.getBytes();
      const base64 = Utilities.base64Encode(bytes);

      return {
        base64: base64,
        mimeType: mimeType,
        fileSize: bytes.length
      };
    } catch (err) {
      Logger.log(`DriveStore.getFileAsBase64 error for [${driveUrlOrId}]: ${err.message}`);
      return null;
    }
  }

  return {
    getOrCreateFolder: getOrCreateFolder,
    getRootDir: getRootDir,
    getWorkOrderFolder: getWorkOrderFolder,
    getFileViewUrl: getFileViewUrl,
    extractFileId: extractFileId,
    saveBase64File: saveBase64File,
    saveBlob: saveBlob,
    moveFormUploadedFile: moveFormUploadedFile,
    getFileAsBase64: getFileAsBase64
  };
})();
