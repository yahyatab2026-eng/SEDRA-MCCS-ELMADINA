/**
 * ============================================================================
 * CMMS SIDRAH - DRIVE STORAGE LAYER (DriveStore.gs)
 * Organizes files in Google Drive: CMMS / Reports / <WO_ID> / ...
 * Handles Base64 image saving, Google Form file uploads moving, and public URLs
 * ============================================================================
 */

const DriveStore = (function() {
  
  /**
   * Retrieves or creates a folder inside a parent folder
   */
  function getOrCreateFolder(folderName, parentFolder = null) {
    const parent = parentFolder || DriveApp.getRootFolder();
    const folders = parent.getFoldersByName(folderName);
    if (folders.hasNext()) {
      return folders.next();
    }
    return parent.createFolder(folderName);
  }

  /**
   * Returns the dedicated folder for a specific Work Order: CMMS / Reports / <WO_ID>
   */
  function getWorkOrderFolder(woId) {
    const root = getOrCreateFolder(CONFIG.ROOT_DRIVE_FOLDER);
    const reports = getOrCreateFolder(CONFIG.REPORTS_DRIVE_FOLDER, root);
    return getOrCreateFolder(woId, reports);
  }

  /**
   * Converts any Drive file to a publicly viewable thumbnail/preview URL
   */
  function getFileViewUrl(file) {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const fileId = file.getId();
    // Use the high-performance Google Drive preview/thumbnail link
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  /**
   * Saves a base64 encoded photo or document into the Work Order folder
   * @param {string} woId Work order identifier
   * @param {string} base64Data Base64 data string (with or without data:image/... prefix)
   * @param {string} fileName Target file name (e.g. before_photo.jpg)
   * @return {string} Drive viewable URL
   */
  function saveBase64File(woId, base64Data, fileName = 'photo.jpg') {
    if (!base64Data) return '';
    
    // If it's already a full HTTP URL, return as-is
    if (base64Data.startsWith('http://') || base64Data.startsWith('https://')) {
      return base64Data;
    }

    try {
      let mimeType = 'image/jpeg';
      let rawBase64 = base64Data;

      if (base64Data.includes(';base64,')) {
        const parts = base64Data.split(';base64,');
        mimeType = parts[0].replace('data:', '') || 'image/jpeg';
        rawBase64 = parts[1];
      }

      const decodedBytes = Utilities.base64Decode(rawBase64);
      const blob = Utilities.newBlob(decodedBytes, mimeType, fileName);
      const folder = getWorkOrderFolder(woId);
      const file = folder.createFile(blob);
      
      return getFileViewUrl(file);
    } catch (e) {
      Logger.log(`Error saving base64 file for ${woId}: ${e.message}`);
      return '';
    }
  }

  /**
   * Moves a file uploaded via Google Form into the structured CMMS folder
   * Google Form file-upload answers are raw Drive file IDs or Google Drive file URLs
   * @param {string} woId Work Order ID
   * @param {string} fileIdOrUrl Drive ID or URL from Google Form answer
   * @param {string} prefix Name prefix (e.g. before_, after_)
   * @return {string} New drive file link
   */
  function moveFormUploadedFile(woId, fileIdOrUrl, prefix = 'before') {
    if (!fileIdOrUrl) return '';

    try {
      let fileId = fileIdOrUrl.trim();
      
      // If full Google Drive URL was passed, extract file ID
      if (fileId.includes('id=')) {
        fileId = fileId.split('id=')[1].split('&')[0];
      } else if (fileId.includes('/d/')) {
        fileId = fileId.split('/d/')[1].split('/')[0];
      }

      const file = DriveApp.getFileById(fileId);
      const targetFolder = getWorkOrderFolder(woId);
      
      // Move file into the structured WO folder
      file.moveTo(targetFolder);
      
      // Rename file with prefix for clean organization
      const originalName = file.getName();
      file.setName(`${prefix}_${originalName}`);
      
      return getFileViewUrl(file);
    } catch (e) {
      Logger.log(`Error moving form uploaded file ${fileIdOrUrl}: ${e.message}`);
      return fileIdOrUrl; // fallback to original input
    }
  }

  /**
   * Reads a Drive file as a Base64 string for passing to the Gemini REST API
   * @param {string} driveUrlOrId Direct link or ID
   * @return {{base64: string, mimeType: string}|null}
   */
  function getFileAsBase64(driveUrlOrId) {
    if (!driveUrlOrId) return null;

    try {
      let fileId = driveUrlOrId.trim();
      if (fileId.includes('id=')) {
        fileId = fileId.split('id=')[1].split('&')[0];
      } else if (fileId.includes('/d/')) {
        fileId = fileId.split('/d/')[1].split('/')[0];
      }

      const file = DriveApp.getFileById(fileId);
      const blob = file.getBlob();
      const mimeType = blob.getContentType() || 'image/jpeg';
      const base64 = Utilities.base64Encode(blob.getBytes());

      return {
        base64: base64,
        mimeType: mimeType
      };
    } catch (e) {
      Logger.log(`Error fetching file base64 for ${driveUrlOrId}: ${e.message}`);
      return null;
    }
  }

  return {
    getWorkOrderFolder: getWorkOrderFolder,
    saveBase64File: saveBase64File,
    moveFormUploadedFile: moveFormUploadedFile,
    getFileAsBase64: getFileAsBase64,
    getFileViewUrl: getFileViewUrl
  };
})();
