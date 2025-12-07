import * as store from './store.js';
import * as ui from './ui.js';
import { analyzeImage, testServiceAvailability } from './api.js';
import { getRatingLabel } from './prompts.js';
import { getSettings, updateSettings } from './settings.js';

document.addEventListener('DOMContentLoaded', () => {
  const el = {
    uploadArea: document.getElementById('upload-area'),
    fileInput: document.getElementById('file-input'),
    previewContainer: document.getElementById('preview-container'),
    startAnalysisBtn: document.getElementById('start-analysis-btn'),
    changeImageBtn: document.getElementById('change-image-btn'),
    tryAgainBtn: document.getElementById('try-again'),
    viewSavedBtn: document.getElementById('view-saved'),
    container: document.querySelector('.container'),
    resultContainer: document.getElementById('result-container'),
    imagePreviewContainerResult: document.getElementById('image-preview-container-result'),
    imagePreviewContainer: document.querySelector('.image-preview-container'),
    modelSelector: document.getElementById('model-selector'),
    
    statusBar: document.getElementById('status-bar'),
    statusText: document.getElementById('status-text'),
    statusPing: document.getElementById('status-ping'),
    
    advancedToggle: document.getElementById('advanced-toggle'),
    advancedContent: document.getElementById('advanced-content'),
    customApiKeyInput: document.getElementById('custom-api-key'),
  };

  let currentAnalysisResult = null;
  let isSavedResultsVisible = false;
  let selectedImageDataUrl = null;

  function initialize(){
    setupEventListeners();
    loadSettings();
    runAutoConnectivityTest();
  }

  function loadSettings(){
    const s = getSettings();
    // Compatibility check: default to 2.5-flash if saved model is missing
    const savedModel = s.selectedModel;
    const modelExists = Array.from(el.modelSelector.options).some(opt => opt.value === savedModel);
    el.modelSelector.value = modelExists ? savedModel : 'gemini-2.5-flash';
    
    el.customApiKeyInput.value = s.customApiKey || '';
  }

  function handleModelChange() {
    updateSettings({ selectedModel: el.modelSelector.value });
    // Re-check connectivity when model changes
    el.statusBar.className = 'status-bar loading';
    el.statusText.textContent = `Testing ${el.modelSelector.options[el.modelSelector.selectedIndex].text}...`;
    runAutoConnectivityTest();
  }

  function handleApiKeyChange() {
    const key = el.customApiKeyInput.value.trim();
    updateSettings({ customApiKey: key });
    
    el.statusBar.className = 'status-bar loading';
    el.statusText.textContent = 'Config updated, re-testing...';
    el.statusPing.textContent = '--ms';
    
    runAutoConnectivityTest();
  }

  async function runAutoConnectivityTest() {
    const startTime = Date.now();
    const result = await testServiceAvailability();
    const pingTime = Date.now() - startTime;

    el.statusBar.classList.remove('loading');

    if (result.success) {
        el.statusBar.classList.add('success');
        el.statusBar.classList.remove('error');
        el.statusText.textContent = 'Service Ready';
        el.statusPing.textContent = `${pingTime}ms`;
    } else {
        el.statusBar.classList.add('error');
        el.statusBar.classList.remove('success');
        el.statusPing.textContent = 'ERR';
        
        // Detailed error for connectivity failure
        if (result.message.includes('Quota') || result.message.includes('429')) {
             el.statusText.textContent = '❌ Model quota exceeded, please switch models';
        } else if (result.message.includes('Server not configured') && !el.customApiKeyInput.value) {
             el.statusText.textContent = 'API Key Missing';
        } else {
             el.statusText.textContent = 'Connection Error: ' + result.message;
        }
    }
  }

  // --- Upload ---
  async function handleFileSelect(){
    if (!el.fileInput.files.length) return;
    const file = el.fileInput.files[0];
    if (file.type === 'image/heic' || file.name.toLowerCase().endsWith('.heic')) {
      try {
        const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.9 });
        const convertedFile = new File([blob], file.name.replace(/\.heic$/i, ".jpg"), { type: "image/jpeg" });
        return processFile(convertedFile);
      } catch (err) {
        alert("HEIC Conversion Failed"); return;
      }
    }
    if (!file.type.startsWith('image/')) { alert('Please select an image file'); return; }
    processFile(file);
  }

  function processFile(file){
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const processed = await ui.ensureUnderMaxBytes(e.target.result, 10 * 1024 * 1024);
        selectedImageDataUrl = processed;
        ui.showPreview(selectedImageDataUrl);
      } catch (err) { alert('Failed to load image'); }
    };
    reader.readAsDataURL(file);
  }

  async function handleStartAnalysis(){
    if (!selectedImageDataUrl) return;
    ui.showLoading(selectedImageDataUrl);
    try{
      const aiType = document.querySelector('input[name="ai-type"]:checked').value;
      const modelName = el.modelSelector.value;
      const response = await analyzeImage(selectedImageDataUrl, aiType, modelName);
      currentAnalysisResult = { ...response, image:selectedImageDataUrl, aiType, model:modelName };
      setTimeout(()=>{
        ui.displayResult(currentAnalysisResult);
        ui.createSaveButton(handleSaveResult);
        ui.createShareButton(handleShareResult);
      }, 300);
    }catch(error){
      // Smart Error Guidance
      let errorMsg = error.message;
      if (errorMsg.includes('Quota') || errorMsg.includes('429')) {
          errorMsg = `💔 Model Quota Exceeded (${el.modelSelector.value})!\n\n💡 Fixes:\n1. Switch models in the dropdown above (Try Lite or Gemma)\n2. Or enter your own API Key in [Advanced Settings]`;
      }
      ui.displayError(errorMsg);
    }
  }

  function handleSaveResult(){
    if (!currentAnalysisResult) return;
    store.addSavedResult({ ...currentAnalysisResult, timestamp:new Date().toISOString() });
    if (isSavedResultsVisible) renderSaved();
  }
  function handleShareResult(){
    if (!currentAnalysisResult) return;
    const txt = `AI Smash or Pass Verdict:\n\nVerdict: ${currentAnalysisResult.verdict}\nRating: ${currentAnalysisResult.rating}/10\nExplanation: "${currentAnalysisResult.explanation}"`;
    navigator.clipboard.writeText(txt).then(()=> alert('Copied to clipboard ✅'));
  }
  function handleDeleteResult(index){ store.deleteSavedResult(index); renderSaved(); }
  function handleViewSavedResult(index){ ui.showPopup(store.getSavedResults()[index]); }
  async function handleTryAgain(){ if (selectedImageDataUrl) await handleStartAnalysis(); else ui.resetToUpload(); }
  function handleChangeImage(){ el.fileInput.removeAttribute('hidden'); el.fileInput.click(); }
  function toggleSavedResults(){
    if (document.querySelector('.saved-results')) { 
        document.querySelector('.saved-results').remove(); 
        el.viewSavedBtn.textContent = '📁 View Saved Results'; 
        isSavedResultsVisible = false; 
    } else { 
        renderSaved(); 
        el.viewSavedBtn.textContent = '📁 Hide Saved Results'; 
        isSavedResultsVisible = true; 
    }
  }
  function renderSaved(){
    const container = ui.createSavedResultsContainer(store.getSavedResults(), { onDelete: handleDeleteResult, onView: handleViewSavedResult });
    if(document.querySelector('.saved-results')) document.querySelector('.saved-results').remove();
    el.container.appendChild(container);
  }

  function setupEventListeners(){
    const zones = [el.uploadArea, el.imagePreviewContainer, el.imagePreviewContainerResult];
    zones.forEach(zone=>{
      if(!zone)return;
      zone.addEventListener('click', ()=>el.fileInput.click());
      zone.addEventListener('dragover', e=>{e.preventDefault();zone.classList.add('drag-over')});
      zone.addEventListener('dragleave', e=>{e.preventDefault();zone.classList.remove('drag-over')});
      zone.addEventListener('drop', e=>{e.preventDefault();zone.classList.remove('drag-over');if(e.dataTransfer.files.length){el.fileInput.files=e.dataTransfer.files;handleFileSelect()}});
    });

    el.fileInput.addEventListener('change', handleFileSelect);
    el.startAnalysisBtn.addEventListener('click', handleStartAnalysis);
    el.changeImageBtn.addEventListener('click', handleChangeImage);
    el.tryAgainBtn.addEventListener('click', handleTryAgain);
    el.viewSavedBtn.addEventListener('click', toggleSavedResults);
    
    el.modelSelector.addEventListener('change', handleModelChange);
    
    el.advancedToggle.addEventListener('click', () => {
        el.advancedContent.classList.toggle('hidden');
        el.advancedToggle.classList.toggle('active');
    });
    el.customApiKeyInput.addEventListener('change', handleApiKeyChange);
    el.customApiKeyInput.addEventListener('blur', handleApiKeyChange);
  }

  initialize();
});