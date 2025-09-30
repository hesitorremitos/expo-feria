import React from 'react';

const DownloadButtons = ({ image }) => {
  const { availableDownloads, originalImages } = image;
  
  if (!availableDownloads.length) return null;

  return (
    <div className={`grid gap-2 ${availableDownloads.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
      {availableDownloads.map((download) => {
        const imageData = originalImages[download.key];
        return (
          <a 
            key={download.key}
            href={imageData.url} 
            download={imageData.fileName}
            className="bg-gray-600 text-white px-4 py-2 rounded text-sm hover:bg-gray-700 transition-colors text-center block"
          >
            {download.label}
          </a>
        );
      })}
    </div>
  );
};

export default DownloadButtons;