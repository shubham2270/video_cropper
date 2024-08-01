// script.js

  const video = document.getElementById('videoPlayer');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const seekBackBtn = document.getElementById('seekBackBtn');
  const seekForwardBtn = document.getElementById('seekForwardBtn');
  const playbackRateSelect = document.getElementById('playbackRate');
  const volumeControl = document.getElementById('volumeControl');
  const seekbar = document.getElementById('seekbar');
  const currentTimeSpan = document.getElementById('currentTime');
  const durationSpan = document.getElementById('duration');
  const cropper = document.getElementById('cropper');
  const aspectRatioSelect = document.getElementById('aspectRatio');
  const resizeHandles = document.querySelectorAll('.resize-handle');
  const previewCanvas = document.getElementById('previewCanvas');
  const previewContext = previewCanvas?.getContext('2d');
  

  let isResizing = false;
  let startX, startY, startWidth, startHeight, startAspectRatio, resizingHandle;

  function updateUI() {
      const currentTime = video.currentTime;
      const duration = video.duration;

      seekbar.value = (currentTime / duration) * 100;
      currentTimeSpan.textContent = formatTime(currentTime);
      durationSpan.textContent = formatTime(duration);
  }




function updatePreview() {
  const videoRect = video.getBoundingClientRect();
  const cropperRect = cropper.getBoundingClientRect();
  
  // Get relative position and size of cropper within the video
  const cropX = cropperRect.left - videoRect.left;
  const cropY = cropperRect.top - videoRect.top;
  const cropWidth = cropperRect.width;
  const cropHeight = cropperRect.height;

  // Set canvas size to match cropper's aspect ratio
  previewCanvas.width = cropWidth;
  previewCanvas.height = cropHeight;

  // Draw cropped area onto the canvas
  previewContext.drawImage(
    video,
    cropX, cropY, cropWidth, cropHeight,
    0, 0, cropWidth, cropHeight
  );
}

// Update preview on cropper movement
cropper?.addEventListener('mousedown', startDrag);
resizeHandles.forEach(handle => handle.addEventListener('mousedown', startResize));

document.addEventListener('mousemove', () => {
  if (isResizing) {
    updatePreview();
  }
});

// Initialize preview on video load
video.addEventListener('loadedmetadata', () => {
  updateCropper();
  updatePreview();
});




  function formatTime(seconds) {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function updateCropper() {
      const ratio = aspectRatioSelect.value.split(':');
      const aspectRatio = ratio[0] / ratio[1];
      const videoHeight = video.clientHeight;
      cropper.style.height = `${videoHeight}px`;
      cropper.style.width = `${videoHeight * aspectRatio}px`;
      cropper.style.top = '0px';
  }

  function startResize(e) {
    e.preventDefault();
    isResizing = true;
    resizingHandle = e.target;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = parseFloat(getComputedStyle(cropper).width.replace('px', ''));
    startHeight = parseFloat(getComputedStyle(cropper).height.replace('px', ''));
    document.addEventListener('mousemove', resizeCropper);
    document.addEventListener('mouseup', stopResize);
}

function resizeCropper(e) {
    if (isResizing) {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const handleClass = resizingHandle.className;

        if (handleClass.includes('bottom-right')) {
            cropper.style.width = `${Math.min(Math.max(startWidth + dx, 50), video.clientWidth)}px`;
            cropper.style.height = `${Math.min(Math.max(startHeight + dy, 50), video.clientHeight)}px`;
        } else if (handleClass.includes('bottom-left')) {
            cropper.style.width = `${Math.min(Math.max(startWidth - dx, 50), video.clientWidth)}px`;
            cropper.style.height = `${Math.min(Math.max(startHeight + dy, 50), video.clientHeight)}px`;
            cropper.style.left = `${parseFloat(getComputedStyle(cropper).left.replace('px', '')) + dx}px`;
        } else if (handleClass.includes('top-right')) {
            cropper.style.width = `${Math.min(Math.max(startWidth + dx, 50), video.clientWidth)}px`;
            cropper.style.height = `${Math.min(Math.max(startHeight - dy, 50), video.clientHeight)}px`;
            cropper.style.top = `${parseFloat(getComputedStyle(cropper).top.replace('px', '')) + dy}px`;
        } else if (handleClass.includes('top-left')) {
            cropper.style.width = `${Math.min(Math.max(startWidth - dx, 50), video.clientWidth)}px`;
            cropper.style.height = `${Math.min(Math.max(startHeight - dy, 50), video.clientHeight)}px`;
            cropper.style.left = `${parseFloat(getComputedStyle(cropper).left.replace('px', '')) + dx}px`;
            cropper.style.top = `${parseFloat(getComputedStyle(cropper).top.replace('px', '')) + dy}px`;
        } else if (handleClass.includes('right')) {
            cropper.style.width = `${Math.min(Math.max(startWidth + dx, 50), video.clientWidth)}px`;
        } else if (handleClass.includes('left')) {
            cropper.style.width = `${Math.min(Math.max(startWidth - dx, 50), video.clientWidth)}px`;
            cropper.style.left = `${parseFloat(getComputedStyle(cropper).left.replace('px', '')) + dx}px`;
        } else if (handleClass.includes('bottom')) {
            cropper.style.height = `${Math.min(Math.max(startHeight + dy, 50), video.clientHeight)}px`;
        } else if (handleClass.includes('top')) {
            cropper.style.height = `${Math.min(Math.max(startHeight - dy, 50), video.clientHeight)}px`;
            cropper.style.top = `${parseFloat(getComputedStyle(cropper).top.replace('px', '')) + dy}px`;
        }
    }
}

  function stopResize() {
      isResizing = false;
      document.removeEventListener('mousemove', resizeCropper);
      document.removeEventListener('mouseup', stopResize);
  }

  function startDrag(e) {
      e.preventDefault();
      const rect = cropper.getBoundingClientRect();
      startX = e.clientX - rect.left;
      startY = e.clientY - rect.top;

      document.addEventListener('mousemove', dragCropper);
      document.addEventListener('mouseup', stopDrag);
  }

  function dragCropper(e) {
      const x = e.clientX - startX;
      const y = e.clientY - startY;

      const maxX = video.clientWidth - cropper.offsetWidth;
      const maxY = video.clientHeight - cropper.offsetHeight;

      cropper.style.left = `${Math.min(Math.max(x, 0), maxX)}px`;
      cropper.style.top = `${Math.min(Math.max(y, 0), maxY)}px`;
  }

  function stopDrag() {
      document.removeEventListener('mousemove', dragCropper);
      document.removeEventListener('mouseup', stopDrag);
  }

  playPauseBtn?.addEventListener('click', () => {
      if (video.paused) {
          video.play();
          playPauseBtn.textContent = 'Pause';
      } else {
          video.pause();
          playPauseBtn.textContent = 'Play';
      }
  });

  seekBackBtn?.addEventListener('click', () => {
      video.currentTime -= 10;
  });

  seekForwardBtn?.addEventListener('click', () => {
      video.currentTime += 10;
  });

  playbackRateSelect.addEventListener('change', () => {
      video.playbackRate = parseFloat(playbackRateSelect.value);
  });

  volumeControl.addEventListener('input', () => {
      video.volume = parseFloat(volumeControl.value);
  });

  seekbar.addEventListener('input', () => {
      const seekTime = (seekbar.value / 100) * video.duration;
      video.currentTime = seekTime;
  });

  aspectRatioSelect.addEventListener('change', () => {
      updateCropper();
  });

  resizeHandles.forEach(handle => {
      handle.addEventListener('mousedown', startResize);
  });

  cropper.addEventListener('mousedown', startDrag);

  video.addEventListener('timeupdate', updateUI);
  video.addEventListener('loadedmetadata', () => {
      updateUI();
      updateCropper();
  });

