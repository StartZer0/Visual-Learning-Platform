import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Trash2, Upload,
  Highlighter, MessageSquare, Palette, Edit3, X, Check, Trash
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import apiService from '../../services/api';
import Button from '../UI/Button';
import EditablePDFTitle from './EditablePDFTitle';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFViewer = ({ material }) => {
  const { state, dispatch } = useApp();
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(material.url);

  // Annotation state
  const [annotations, setAnnotations] = useState(material.annotations || []);
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState('#ffff00');
  const [selectedText, setSelectedText] = useState(null);
  const [showCommentDialog, setShowCommentDialog] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [showAnnotationPanel, setShowAnnotationPanel] = useState(false);

  // Refs
  const pageRef = useRef(null);
  const textLayerRef = useRef(null);

  // Highlight colors
  const highlightColors = [
    { name: 'Yellow', value: '#ffff00', bg: 'bg-yellow-200' },
    { name: 'Green', value: '#90EE90', bg: 'bg-green-200' },
    { name: 'Blue', value: '#87CEEB', bg: 'bg-blue-200' },
    { name: 'Pink', value: '#FFB6C1', bg: 'bg-pink-200' },
    { name: 'Orange', value: '#FFA500', bg: 'bg-orange-200' },
    { name: 'Purple', value: '#DDA0DD', bg: 'bg-purple-200' }
  ];

  // Effect to restore PDF URL if needed
  useEffect(() => {
    const restorePdfUrl = async () => {
      // If we don't have a URL but have a filename and it's persistent, try to restore
      if (!material.url && material.filename && material.isPersistent) {
        try {
          const backendAvailable = await apiService.checkHealth();
          if (backendAvailable) {
            const restoredUrl = apiService.getFileUrl(material.filename);
            setPdfUrl(restoredUrl);

            // Update the material in state
            dispatch({
              type: 'UPDATE_STUDY_MATERIAL',
              payload: {
                ...material,
                url: restoredUrl,
                needsReupload: false
              }
            });

            console.log('Restored PDF URL:', material.title);
          }
        } catch (error) {
          console.error('Failed to restore PDF URL:', error);
          setError('Failed to load PDF from storage');
        }
      }
    };

    restorePdfUrl();
  }, [material, dispatch]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error('Error loading PDF:', error);
    setLoading(false);
    setError('Failed to load PDF. Please try uploading the file again.');
  };

  // Annotation management functions
  const saveAnnotations = useCallback((newAnnotations) => {
    const updatedMaterial = {
      ...material,
      annotations: newAnnotations,
      lastModified: new Date().toISOString()
    };

    dispatch({
      type: 'UPDATE_STUDY_MATERIAL',
      payload: updatedMaterial
    });

    setAnnotations(newAnnotations);
  }, [material, dispatch]);

  const handleTextSelection = useCallback(() => {
    if (!isHighlighting) return;

    const selection = window.getSelection();
    if (selection.rangeCount === 0 || selection.toString().trim() === '') return;

    const range = selection.getRangeAt(0);
    const selectedTextContent = selection.toString().trim();

    // Get the position relative to the page
    const pageElement = pageRef.current;
    if (!pageElement) return;

    const pageRect = pageElement.getBoundingClientRect();
    const rangeRect = range.getBoundingClientRect();

    const annotation = {
      id: Date.now().toString(),
      type: 'highlight',
      pageNumber: pageNumber,
      text: selectedTextContent,
      color: selectedHighlightColor,
      position: {
        x: (rangeRect.left - pageRect.left) / scale,
        y: (rangeRect.top - pageRect.top) / scale,
        width: rangeRect.width / scale,
        height: rangeRect.height / scale
      },
      comment: '',
      createdAt: new Date().toISOString()
    };

    setSelectedText(annotation);
    setShowCommentDialog(true);
    selection.removeAllRanges();
  }, [isHighlighting, selectedHighlightColor, pageNumber, scale]);

  const addHighlight = (comment = '') => {
    if (!selectedText) return;

    const newAnnotation = {
      ...selectedText,
      comment: comment
    };

    const newAnnotations = [...annotations, newAnnotation];
    saveAnnotations(newAnnotations);

    setSelectedText(null);
    setShowCommentDialog(false);
    setCommentText('');
  };

  const deleteAnnotation = (annotationId) => {
    const newAnnotations = annotations.filter(ann => ann.id !== annotationId);
    saveAnnotations(newAnnotations);
  };

  const updateAnnotationComment = (annotationId, newComment) => {
    const newAnnotations = annotations.map(ann =>
      ann.id === annotationId ? { ...ann, comment: newComment } : ann
    );
    saveAnnotations(newAnnotations);
    setEditingComment(null);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(3, prev + 0.2));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.2));
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this PDF?')) {
      // Clean up persistent storage if the file is persistent
      if (material.isPersistent) {
        try {
          await fileUrlManager.deleteFile(material.id);
          console.log('Deleted persistent file:', material.title);
        } catch (error) {
          console.error('Failed to delete persistent file:', error);
        }
      }

      dispatch({ type: 'DELETE_STUDY_MATERIAL', payload: material.id });
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = material.url;
    link.download = material.title;
    link.click();
  };

  const handleFileReupload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      try {
        // Check if backend is available
        const backendAvailable = await apiService.checkHealth();

        let fileUrl, isPersistent, filename;

        if (backendAvailable) {
          // Upload to backend for persistent storage
          try {
            const uploadResult = await apiService.uploadFile(file, material.id);
            fileUrl = apiService.getFileUrl(uploadResult.filename);
            filename = uploadResult.filename;
            isPersistent = true;
            console.log('PDF re-uploaded to backend:', file.name);
          } catch (backendError) {
            console.warn('Backend upload failed, using fallback:', backendError);
            fileUrl = URL.createObjectURL(file);
            isPersistent = false;
          }
        } else {
          // Fallback to blob URL if backend not available
          console.warn('Backend not available, using blob URL');
          fileUrl = URL.createObjectURL(file);
          isPersistent = false;
        }

        // Update the existing material with new file
        const updatedMaterial = {
          ...material,
          title: file.name, // Update title to new filename
          // Keep existing displayName if it was customized, otherwise use new filename
          displayName: material.displayName && material.displayName !== material.title
            ? material.displayName
            : file.name,
          url: fileUrl,
          filename: filename,
          isPersistent: isPersistent,
          needsReupload: !isPersistent,
        };

        dispatch({
          type: 'UPDATE_STUDY_MATERIAL',
          payload: updatedMaterial,
        });

        // Update local state
        setPdfUrl(fileUrl);

        if (isPersistent) {
          alert(`✅ PDF "${file.name}" re-uploaded successfully and saved permanently!`);
        } else {
          alert(`⚠️ PDF "${file.name}" re-uploaded (will need re-upload after refresh - start backend for permanent storage)`);
        }
      } catch (error) {
        console.error('Error re-uploading PDF:', error);
        alert('Failed to re-upload PDF file. Please try again.');
      }
    } else {
      alert(`File type "${file.type}" is not supported. Only PDF files are allowed.`);
    }

    // Reset the input
    event.target.value = '';
  };

  return (
    <div className="panel">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1 min-w-0">
          <EditablePDFTitle material={material} />
          {numPages && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Page {pageNumber} of {numPages}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {/* Annotation Tools */}
          <Button
            variant={isHighlighting ? "primary" : "ghost"}
            size="sm"
            onClick={() => setIsHighlighting(!isHighlighting)}
            icon={<Highlighter className="h-4 w-4" />}
            title="Toggle highlighting mode"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAnnotationPanel(!showAnnotationPanel)}
            icon={<MessageSquare className="h-4 w-4" />}
            title="Show annotations"
          />

          {/* Color Picker */}
          {isHighlighting && (
            <div className="flex items-center space-x-1 border-l border-gray-300 dark:border-gray-600 pl-2">
              {highlightColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => setSelectedHighlightColor(color.value)}
                  className={`w-6 h-6 rounded border-2 ${
                    selectedHighlightColor === color.value
                      ? 'border-gray-800 dark:border-gray-200'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={`Highlight with ${color.name}`}
                />
              ))}
            </div>
          )}

          <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />

          {/* PDF Controls */}
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomOut}
            icon={<ZoomOut className="h-4 w-4" />}
            disabled={scale <= 0.5}
            title="Zoom out"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={zoomIn}
            icon={<ZoomIn className="h-4 w-4" />}
            disabled={scale >= 3}
            title="Zoom in"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            icon={<Download className="h-4 w-4" />}
            title="Download PDF"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            icon={<Trash2 className="h-4 w-4" />}
            className="text-red-600 hover:text-red-700"
            title="Delete PDF"
          />
        </div>
      </div>

      <div className="p-4">
        {material.needsReupload ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="text-yellow-800 dark:text-yellow-200 text-sm text-center mb-4">
              <strong>PDF needs to be re-uploaded</strong><br />
              This PDF was uploaded in a previous session. Please upload it again to view.
            </div>
            <div className="flex justify-center">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileReupload}
                  className="hidden"
                />
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Upload className="h-4 w-4" />}
                  as="span"
                >
                  Upload PDF
                </Button>
              </label>
            </div>
          </div>
        ) : !pdfUrl ? (
          <div className="text-center py-8">
            <div className="text-gray-500 dark:text-gray-400 mb-4">
              📄 Restoring PDF...
            </div>
            <div className="text-sm text-gray-400 dark:text-gray-500 mb-4">
              Attempting to restore PDF from storage...
            </div>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading PDF...</span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                <div className="text-red-800 dark:text-red-200 text-sm">
                  <strong>Error:</strong> {error}
                </div>
              </div>
            )}

            <div className="flex flex-col items-center">
              <div
                ref={pageRef}
                className="relative"
                onMouseUp={handleTextSelection}
                style={{ userSelect: isHighlighting ? 'text' : 'auto' }}
              >
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  onLoadError={onDocumentLoadError}
                  loading=""
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={false}
                  />
                </Document>

                {/* Annotation Overlays */}
                {annotations
                  .filter(ann => ann.pageNumber === pageNumber)
                  .map((annotation) => (
                    <div
                      key={annotation.id}
                      className="absolute pointer-events-none"
                      style={{
                        left: `${annotation.position.x * scale}px`,
                        top: `${annotation.position.y * scale}px`,
                        width: `${annotation.position.width * scale}px`,
                        height: `${annotation.position.height * scale}px`,
                        backgroundColor: annotation.color,
                        opacity: 0.3,
                        borderRadius: '2px'
                      }}
                    />
                  ))}

                {/* Comment Indicators */}
                {annotations
                  .filter(ann => ann.pageNumber === pageNumber && ann.comment)
                  .map((annotation) => (
                    <div
                      key={`comment-${annotation.id}`}
                      className="absolute cursor-pointer pointer-events-auto"
                      style={{
                        left: `${(annotation.position.x + annotation.position.width) * scale + 5}px`,
                        top: `${annotation.position.y * scale}px`,
                      }}
                      onClick={() => setEditingComment(annotation.id)}
                      title={annotation.comment}
                    >
                      <MessageSquare className="h-4 w-4 text-blue-600 bg-white rounded shadow" />
                    </div>
                  ))}
              </div>

              {numPages && (
                <div className="flex items-center space-x-4 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPrevPage}
                    disabled={pageNumber <= 1}
                    icon={<ChevronLeft className="h-4 w-4" />}
                  >
                    Previous
                  </Button>

                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {pageNumber} / {numPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={pageNumber >= numPages}
                    icon={<ChevronRight className="h-4 w-4" />}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Comment Dialog */}
      {showCommentDialog && selectedText && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Add Comment to Highlight</h3>
            <div className="mb-4">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Selected text:</div>
              <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-sm max-h-20 overflow-y-auto">
                "{selectedText.text}"
              </div>
            </div>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment (optional)..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              rows={3}
            />
            <div className="flex justify-end space-x-2 mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCommentDialog(false);
                  setSelectedText(null);
                  setCommentText('');
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => addHighlight(commentText)}
                icon={<Check className="h-4 w-4" />}
              >
                Add Highlight
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Annotation Panel */}
      {showAnnotationPanel && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 border-l border-gray-300 dark:border-gray-600 shadow-lg z-40 overflow-y-auto">
          <div className="p-4 border-b border-gray-300 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Annotations</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnnotationPanel(false)}
                icon={<X className="h-4 w-4" />}
              />
            </div>
          </div>

          <div className="p-4">
            {annotations.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <Highlighter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No annotations yet</p>
                <p className="text-sm mt-2">Enable highlighting mode and select text to create annotations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {annotations.map((annotation) => (
                  <div key={annotation.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: annotation.color }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Page {annotation.pageNumber}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteAnnotation(annotation.id)}
                        icon={<Trash className="h-3 w-3" />}
                        className="text-red-600 hover:text-red-700"
                      />
                    </div>

                    <div className="text-sm mb-2 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                      "{annotation.text}"
                    </div>

                    {editingComment === annotation.id ? (
                      <div className="space-y-2">
                        <textarea
                          defaultValue={annotation.comment}
                          className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          rows={2}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.ctrlKey) {
                              updateAnnotationComment(annotation.id, e.target.value);
                            } else if (e.key === 'Escape') {
                              setEditingComment(null);
                            }
                          }}
                        />
                        <div className="flex justify-end space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingComment(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={(e) => {
                              const textarea = e.target.closest('.space-y-2').querySelector('textarea');
                              updateAnnotationComment(annotation.id, textarea.value);
                            }}
                            icon={<Check className="h-3 w-3" />}
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <div className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                          {annotation.comment || (
                            <span className="italic text-gray-500 dark:text-gray-400">No comment</span>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingComment(annotation.id)}
                          icon={<Edit3 className="h-3 w-3" />}
                          className="ml-2"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
