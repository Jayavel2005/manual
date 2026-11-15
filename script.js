/**
 * FileHub – Public File Preview Engine
 * Pure Vanilla JavaScript (ES6+)
 * 
 * Features:
 * - Single source of truth fileConfig object
 * - Dynamic DOM binding for file metadata
 * - Dedicated PDF modal viewer with iframe
 * - Loading spinner & robust error state handling
 * - Native Fullscreen API with fallback support
 * - Keyboard navigation (Esc to close, F to toggle fullscreen)
 * - Accessible focus trapping & screen-reader notifications
 * - Clipboard link sharing with toast message
 */

// ==========================================================================
// 1. File Configuration Object (Single Source of Truth)
// ==========================================================================
const fileConfig = {
  name: "Project Documentation",
  type: "PDF",
  size: "1.5 MB",
  updated: "November 15, 2026",
  path: "files/document.pdf"
};

// ==========================================================================
// 2. DOM Elements Cache
// ==========================================================================
const elements = {
  // Card elements
  fileName: document.getElementById('fileName'),
  fileSize: document.getElementById('fileSize'),
  fileUpdated: document.getElementById('fileUpdated'),
  fileTypeBadge: document.getElementById('fileTypeBadge'),
  fileExtensionTag: document.getElementById('fileExtensionTag'),
  metaFormat: document.getElementById('metaFormat'),
  metaSize: document.getElementById('metaSize'),
  metaDate: document.getElementById('metaDate'),
  downloadBtn: document.getElementById('downloadBtn'),
  previewBtn: document.getElementById('previewBtn'),
  shareBtn: document.getElementById('shareBtn'),

  // Modal elements
  previewModal: document.getElementById('previewModal'),
  modalDialog: document.getElementById('modalDialog'),
  modalFileTitle: document.getElementById('modalFileTitle'),
  modalFileType: document.getElementById('modalFileType'),
  modalFileSize: document.getElementById('modalFileSize'),
  modalOpenExternal: document.getElementById('modalOpenExternal'),
  modalDownload: document.getElementById('modalDownload'),
  closeModalBtn: document.getElementById('closeModalBtn'),
  fullscreenBtn: document.getElementById('fullscreenBtn'),
  fullscreenBtnText: document.getElementById('fullscreenBtnText'),
  fsIconEnter: document.querySelector('.fs-icon-enter'),
  fsIconExit: document.querySelector('.fs-icon-exit'),

  // Viewer state elements
  pdfViewerFrame: document.getElementById('pdfViewerFrame'),
  viewerLoading: document.getElementById('viewerLoading'),
  viewerError: document.getElementById('viewerError'),
  errorMessage: document.getElementById('errorMessage'),
  retryPreviewBtn: document.getElementById('retryPreviewBtn'),
  errorDownloadBtn: document.getElementById('errorDownloadBtn'),
  mobileOpenLink: document.getElementById('mobileOpenLink'),

  // About dialog elements
  aboutModal: document.getElementById('aboutModal'),
  openAboutBtn: document.getElementById('openAboutBtn'),
  closeAboutBtn: document.getElementById('closeAboutBtn'),
  aboutDismissBtn: document.getElementById('aboutDismissBtn'),
  navHomeLink: document.getElementById('navHomeLink'),

  // Toast
  toast: document.getElementById('toastNotification'),
  toastMessage: document.getElementById('toastMessage')
};

// Track the element that triggered the modal for accessibility
let lastFocusedElement = null;
let toastTimeout = null;
let loadTimeout = null;

// ==========================================================================
// 3. Application Initialization
// ==========================================================================
function initApp() {
  renderFileDetails();
  bindEventListeners();
  console.log(`[FileHub] Initialized with document: ${fileConfig.name} (${fileConfig.path})`);
}

/**
 * Render file metadata across the homepage card and modal header
 */
function renderFileDetails() {
  // Update card elements
  if (elements.fileName) elements.fileName.textContent = fileConfig.name;
  if (elements.fileSize) elements.fileSize.textContent = fileConfig.size;
  if (elements.fileUpdated) elements.fileUpdated.textContent = fileConfig.updated;
  if (elements.fileTypeBadge) elements.fileTypeBadge.textContent = fileConfig.type;
  if (elements.fileExtensionTag) elements.fileExtensionTag.textContent = fileConfig.type;

  // Update metadata grid
  if (elements.metaFormat) elements.metaFormat.textContent = `Adobe ${fileConfig.type}`;
  if (elements.metaSize) elements.metaSize.textContent = fileConfig.size;
  if (elements.metaDate) elements.metaDate.textContent = fileConfig.updated;

  // Update download button on homepage
  if (elements.downloadBtn) {
    elements.downloadBtn.href = fileConfig.path;
    elements.downloadBtn.setAttribute('download', `${fileConfig.name}.${fileConfig.type.toLowerCase()}`);
  }

  // Update modal header elements
  if (elements.modalFileTitle) elements.modalFileTitle.textContent = `${fileConfig.name}.${fileConfig.type.toLowerCase()}`;
  if (elements.modalFileType) elements.modalFileType.textContent = fileConfig.type;
  if (elements.modalFileSize) elements.modalFileSize.textContent = fileConfig.size;

  // Update modal action links
  if (elements.modalOpenExternal) elements.modalOpenExternal.href = fileConfig.path;
  if (elements.modalDownload) {
    elements.modalDownload.href = fileConfig.path;
    elements.modalDownload.setAttribute('download', `${fileConfig.name}.${fileConfig.type.toLowerCase()}`);
  }
  if (elements.errorDownloadBtn) {
    elements.errorDownloadBtn.href = fileConfig.path;
    elements.errorDownloadBtn.setAttribute('download', `${fileConfig.name}.${fileConfig.type.toLowerCase()}`);
  }
  if (elements.mobileOpenLink) {
    elements.mobileOpenLink.href = fileConfig.path;
  }
}

// ==========================================================================
// 4. Preview Modal Operations
// ==========================================================================

/**
 * Open the dedicated preview interface
 */
function openPreview() {
  lastFocusedElement = document.activeElement;

  // Show modal container
  elements.previewModal.hidden = false;
  // Force a reflow before adding class for smooth CSS transition
  elements.previewModal.offsetHeight;
  elements.previewModal.classList.add('is-active');
  document.body.classList.add('modal-open');

  // Reset viewer state
  showViewerLoading();

  // Load the actual file
  loadDocument();

  // Focus the close button for accessibility
  if (elements.closeModalBtn) {
    elements.closeModalBtn.focus();
  }
}

/**
 * Close the preview interface
 */
function closePreview() {
  if (loadTimeout) {
    clearTimeout(loadTimeout);
    loadTimeout = null;
  }

  // If in fullscreen mode, exit fullscreen first
  if (document.fullscreenElement || document.webkitFullscreenElement) {
    exitFullscreen();
  }

  elements.previewModal.classList.remove('is-active');
  document.body.classList.remove('modal-open');

  // Wait for CSS transition to finish before hiding from DOM
  setTimeout(() => {
    elements.previewModal.hidden = true;
    
    // Reset iframe source to release browser memory
    if (elements.pdfViewerFrame) {
      elements.pdfViewerFrame.src = "about:blank";
    }

    // Restore focus to the trigger button
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }, 250);
}

/**
 * Load the actual PDF document into the iframe
 */
function loadDocument() {
  showViewerLoading();

  // Test if file is accessible via HEAD request
  fetch(fileConfig.path, { method: 'HEAD' })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: File not found at '${fileConfig.path}'`);
      }
      
      // File exists! Load into iframe
      attachIframeSource();
    })
    .catch(err => {
      console.warn('[FileHub] Pre-fetch check warning:', err.message);
      // Fallback: Still attempt direct iframe load (useful in file:// protocol where fetch may be restricted)
      attachIframeSource();
    });
}

/**
 * Attach source URL to iframe and bind load/error events
 */
function attachIframeSource() {
  const frame = elements.pdfViewerFrame;
  if (!frame) return;

  // Append toolbar parameter for PDF viewer
  const fileUrl = `${fileConfig.path}#toolbar=1&navpanes=0&view=FitH`;

  // Timeout guard: If iframe takes longer than 8 seconds, check fallback
  if (loadTimeout) clearTimeout(loadTimeout);
  loadTimeout = setTimeout(() => {
    if (elements.viewerLoading.style.display !== 'none') {
      console.info('[FileHub] Loading timeout reached; presenting direct viewer');
      hideViewerLoading();
    }
  }, 8000);

  // Setup onload handler
  frame.onload = function() {
    if (loadTimeout) {
      clearTimeout(loadTimeout);
      loadTimeout = null;
    }
    // Small delay to ensure browser PDF engine is painted
    setTimeout(() => {
      hideViewerLoading();
    }, 150);
  };

  // Setup onerror handler
  frame.onerror = function() {
    if (loadTimeout) clearTimeout(loadTimeout);
    showViewerError(`Unable to render '${fileConfig.name}'. The file may be missing or blocked by browser security.`);
  };

  // Set source
  frame.src = fileUrl;
}

/**
 * Show loading indicator
 */
function showViewerLoading() {
  if (elements.viewerLoading) elements.viewerLoading.style.display = 'flex';
  if (elements.viewerError) elements.viewerError.style.display = 'none';
}

/**
 * Hide loading indicator
 */
function hideViewerLoading() {
  if (elements.viewerLoading) elements.viewerLoading.style.display = 'none';
}

/**
 * Show error state with customized message
 */
function showViewerError(message) {
  if (elements.viewerLoading) elements.viewerLoading.style.display = 'none';
  if (elements.viewerError) {
    elements.viewerError.style.display = 'flex';
    if (elements.errorMessage && message) {
      elements.errorMessage.textContent = message;
    }
  }
}

// ==========================================================================
// 5. Fullscreen Preview Operations
// ==========================================================================

/**
 * Toggle full-screen mode on the preview modal
 */
function toggleFullscreen() {
  const container = elements.modalDialog;

  const isFullscreen = document.fullscreenElement || 
                       document.webkitFullscreenElement || 
                       document.mozFullScreenElement || 
                       document.msFullscreenElement ||
                       container.classList.contains('fullscreen-mode');

  if (!isFullscreen) {
    requestFullscreen(container);
  } else {
    exitFullscreen();
  }
}

function requestFullscreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen().catch(() => enableFallbackFullscreen());
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen();
  } else {
    enableFallbackFullscreen();
  }
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    document.exitFullscreen().catch(() => disableFallbackFullscreen());
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  } else {
    disableFallbackFullscreen();
  }
}

function enableFallbackFullscreen() {
  elements.modalDialog.classList.add('fullscreen-mode');
  updateFullscreenUI(true);
}

function disableFallbackFullscreen() {
  elements.modalDialog.classList.remove('fullscreen-mode');
  updateFullscreenUI(false);
}

function updateFullscreenUI(isActive) {
  if (isActive) {
    if (elements.fsIconEnter) elements.fsIconEnter.style.display = 'none';
    if (elements.fsIconExit) elements.fsIconExit.style.display = 'inline-block';
    if (elements.fullscreenBtnText) elements.fullscreenBtnText.textContent = 'Exit';
    if (elements.fullscreenBtn) elements.fullscreenBtn.setAttribute('title', 'Exit full screen (F or Esc)');
  } else {
    if (elements.fsIconEnter) elements.fsIconEnter.style.display = 'inline-block';
    if (elements.fsIconExit) elements.fsIconExit.style.display = 'none';
    if (elements.fullscreenBtnText) elements.fullscreenBtnText.textContent = 'Fullscreen';
    if (elements.fullscreenBtn) elements.fullscreenBtn.setAttribute('title', 'Toggle full screen (F)');
  }
}

// Sync UI when user enters or exits fullscreen via browser native controls
document.addEventListener('fullscreenchange', () => {
  const isFs = Boolean(document.fullscreenElement);
  updateFullscreenUI(isFs);
});
document.addEventListener('webkitfullscreenchange', () => {
  const isFs = Boolean(document.webkitFullscreenElement);
  updateFullscreenUI(isFs);
});

// ==========================================================================
// 6. About Modal Operations
// ==========================================================================
function openAbout() {
  lastFocusedElement = document.activeElement;
  elements.aboutModal.hidden = false;
  elements.aboutModal.offsetHeight;
  elements.aboutModal.classList.add('is-active');
  document.body.classList.add('modal-open');
  if (elements.closeAboutBtn) elements.closeAboutBtn.focus();
}

function closeAbout() {
  elements.aboutModal.classList.remove('is-active');
  document.body.classList.remove('modal-open');
  setTimeout(() => {
    elements.aboutModal.hidden = true;
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
      lastFocusedElement.focus();
    }
  }, 200);
}

// ==========================================================================
// 7. Clipboard Sharing & Toast Notifications
// ==========================================================================
function copyShareLink() {
  const url = window.location.href;
  
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url)
      .then(() => showToast('Share link copied to clipboard!'))
      .catch(() => fallbackCopy(url));
  } else {
    fallbackCopy(url);
  }
}

function fallbackCopy(text) {
  const input = document.createElement('input');
  input.value = text;
  input.style.position = 'fixed';
  input.style.opacity = '0';
  document.body.appendChild(input);
  input.select();
  try {
    document.execCommand('copy');
    showToast('Share link copied to clipboard!');
  } catch (e) {
    showToast('Public URL: ' + window.location.href);
  }
  document.body.removeChild(input);
}

function showToast(message) {
  if (toastTimeout) clearTimeout(toastTimeout);

  if (elements.toastMessage) elements.toastMessage.textContent = message;
  elements.toast.hidden = false;
  elements.toast.offsetHeight;
  elements.toast.classList.add('show');

  toastTimeout = setTimeout(() => {
    elements.toast.classList.remove('show');
    setTimeout(() => {
      elements.toast.hidden = true;
    }, 250);
  }, 3200);
}

// ==========================================================================
// 8. Event Listeners Binding
// ==========================================================================
function bindEventListeners() {
  // Preview triggers
  if (elements.previewBtn) {
    elements.previewBtn.addEventListener('click', openPreview);
  }

  // Close triggers
  if (elements.closeModalBtn) {
    elements.closeModalBtn.addEventListener('click', closePreview);
  }

  // Backdrop click to close preview
  if (elements.previewModal) {
    elements.previewModal.addEventListener('click', (e) => {
      if (e.target === elements.previewModal) {
        closePreview();
      }
    });
  }

  // Fullscreen trigger
  if (elements.fullscreenBtn) {
    elements.fullscreenBtn.addEventListener('click', toggleFullscreen);
  }

  // Retry button
  if (elements.retryPreviewBtn) {
    elements.retryPreviewBtn.addEventListener('click', () => {
      loadDocument();
    });
  }

  // Share button
  if (elements.shareBtn) {
    elements.shareBtn.addEventListener('click', copyShareLink);
  }

  // About modal triggers
  if (elements.openAboutBtn) {
    elements.openAboutBtn.addEventListener('click', openAbout);
  }
  if (elements.closeAboutBtn) {
    elements.closeAboutBtn.addEventListener('click', closeAbout);
  }
  if (elements.aboutDismissBtn) {
    elements.aboutDismissBtn.addEventListener('click', closeAbout);
  }
  if (elements.aboutModal) {
    elements.aboutModal.addEventListener('click', (e) => {
      if (e.target === elements.aboutModal) {
        closeAbout();
      }
    });
  }

  // Home navigation link
  if (elements.navHomeLink) {
    elements.navHomeLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // ESC key closes any open modal
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (elements.previewModal && !elements.previewModal.hidden) {
        closePreview();
      } else if (elements.aboutModal && !elements.aboutModal.hidden) {
        closeAbout();
      }
    }

    // 'F' key toggles fullscreen while in preview modal
    if ((e.key === 'f' || e.key === 'F') && elements.previewModal && !elements.previewModal.hidden) {
      // Don't trigger if an input or editable field is active
      if (document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        toggleFullscreen();
      }
    }
  });
}

// Start application when DOM is parsed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
