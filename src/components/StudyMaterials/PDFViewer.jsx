import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Trash2, Upload } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import fileUrlManager from '../../utils/fileUrlManager';
import Button from '../UI/Button';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFViewer = ({ material }) => {
  const { dispatch } = useApp();
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        // Store file persistently and get URL
        const fileUrl = await fileUrlManager.updateFileAndGetUrl(material.id, file, file.name);

        if (!fileUrl) {
          throw new Error('Failed to store file persistently');
        }

        // Update the existing material with new persistent file
        dispatch({
          type: 'UPDATE_STUDY_MATERIAL',
          payload: {
            ...material,
            title: file.name, // Update title to new filename
            url: fileUrl,
            isPersistent: true,
            needsReupload: false,
          },
        });

        console.log('PDF re-uploaded and stored persistently:', file.name);
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
          <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {material.title}
          </h3>
          {numPages && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Page {pageNumber} of {numPages}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-1">
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
              <Document
                file={material.url}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading=""
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                />
              </Document>

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
    </div>
  );
};

export default PDFViewer;
