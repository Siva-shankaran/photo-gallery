document.addEventListener("DOMContentLoaded", function () {
  const categories = ["Groom Family", "Bride Family", "Friends", "Bride & Groom", "Children"];
  let selectedCategory = "Groom Family";
  let imageList = [];
  let previewImage = null;
  let currentIndex = 0;
  let loadedCount = 20;
  let loading = false;
  let selectedImages = new Set();
  const observer = new IntersectionObserver(handleObserver, { threshold: 1.0 });

  const galleryContainer = document.createElement("div");
  galleryContainer.className = "gallery-container";

  const title = document.createElement("h1");
  title.className = "gallery-title";
  title.innerText = "Photo Gallery";
  galleryContainer.appendChild(title);

  const tabs = document.createElement("div");
  tabs.className = "gallery-tabs";
  categories.forEach((cat) => {
    const button = document.createElement("button");
    button.className = `tab-button ${selectedCategory === cat ? "active" : ""}`;
    button.innerText = cat;
    button.addEventListener("click", () => {
      selectedCategory = cat;
      resetGallery();
      loadImages(selectedCategory, 20);
    });
    tabs.appendChild(button);
  });
  galleryContainer.appendChild(tabs);

  const selectModeButton = document.createElement("button");
  selectModeButton.className = "select-mode-button";
  selectModeButton.innerText = "Select Photos";
  let selectionMode = false;
  selectModeButton.addEventListener("click", () => {
    selectionMode = !selectionMode;
    selectModeButton.innerText = selectionMode ? "Cancel Selection" : "Select Photos";
    selectedImages.clear();
    updateSelectionCount();
    updateDownloadButton();
  });
  galleryContainer.appendChild(selectModeButton);

  const selectInfo = document.createElement("p");
  selectInfo.className = "select-info";
  selectInfo.innerText = "Selected Photos: 0";
  galleryContainer.appendChild(selectInfo);

  const grid = document.createElement("div");
  grid.className = "gallery-grid";
  galleryContainer.appendChild(grid);

  const downloadButton = document.createElement("button");
  downloadButton.className = "download-selected-button";
  downloadButton.innerText = "Download Selected Photos";
  downloadButton.style.display = "none";
  downloadButton.addEventListener("click", downloadSelectedImages);
  galleryContainer.appendChild(downloadButton);

  const loadTrigger = document.createElement("div");
  loadTrigger.id = "load-more-trigger";
  loadTrigger.style.height = "20px";
  galleryContainer.appendChild(loadTrigger);
  observer.observe(loadTrigger);

  document.body.appendChild(galleryContainer);

  function loadImages(category, count) {
    if (loading) return;
    loading = true;
    setTimeout(() => {
      const categoryFolder = category.toLowerCase().replace(/ & /g, "-").replace(/ /g, "-");
      for (let i = loadedCount; i < loadedCount + 20; i++) {
        const imgSrc = `/images/${categoryFolder}/${categoryFolder}${i + 1}.webp`;
        const imgContainer = document.createElement("div");
        imgContainer.className = "gallery-item";
        imgContainer.addEventListener("click", (event) => toggleSelection(imgSrc, imgContainer, event));

        const img = document.createElement("img");
        img.src = imgSrc;
        img.alt = "Gallery";
        img.className = "gallery-image";
        img.loading = "lazy";

        imgContainer.appendChild(img);
        grid.appendChild(imgContainer);
        imageList.push(imgSrc);
      }
      loadedCount += 20;
      loading = false;
    }, 500);
  }

  function handleObserver(entries) {
    const target = entries[0];
    if (target.isIntersecting && !loading) {
      loadImages(selectedCategory, loadedCount);
    }
  }

  function toggleSelection(imgSrc, imgContainer) {
    if (!selectionMode) return;
    if (selectedImages.has(imgSrc)) {
      selectedImages.delete(imgSrc);
      imgContainer.classList.remove("selected");
    } else {
      selectedImages.add(imgSrc);
      imgContainer.classList.add("selected");
    }
    updateSelectionCount();
    updateDownloadButton();
  }

  function updateSelectionCount() {
    selectInfo.innerText = `Selected Photos: ${selectedImages.size}`;
  }

  function updateDownloadButton() {
    downloadButton.style.display = selectedImages.size > 0 ? "block" : "none";
  }

  function downloadSelectedImages() {
    selectedImages.forEach(imgSrc => {
      const link = document.createElement("a");
      link.href = imgSrc;
      link.download = imgSrc.split("/").pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }

  

  function openPreview(imgSrc, index) {
    currentIndex = index;
    previewImage = imgSrc;

    const overlay = document.createElement("div");
    overlay.className = "overlay";

    const overlayContent = document.createElement("div");
    overlayContent.className = "overlay-content";

    const closeButton = document.createElement("button");
    closeButton.className = "close-button";
    closeButton.innerText = "×";
    closeButton.addEventListener("click", () => overlay.remove());

    const leftButton = document.createElement("button");
    leftButton.className = "nav-button left";
    leftButton.innerText = "←";
    leftButton.addEventListener("click", prevImage);

    const previewImg = document.createElement("img");
    previewImg.src = previewImage;
    previewImg.alt = "Preview";
    previewImg.className = "preview-image";

    const rightButton = document.createElement("button");
    rightButton.className = "nav-button right";
    rightButton.innerText = "→";
    rightButton.addEventListener("click", nextImage);

    const downloadLink = document.createElement("a");
    downloadLink.href = previewImage;
    downloadLink.download = "true";
    downloadLink.className = "download-button";
    downloadLink.innerText = "Download HD";

    overlayContent.append(closeButton, leftButton, previewImg, rightButton, downloadLink);
    overlay.appendChild(overlayContent);
    document.body.appendChild(overlay);
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + imageList.length) % imageList.length;
    openPreview(imageList[currentIndex], currentIndex);
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % imageList.length;
    openPreview(imageList[currentIndex], currentIndex);
  }

  function resetGallery() {
    grid.innerHTML = "";
    imageList = [];
    loadedCount = 20;
    selectedImages.clear();
    updateSelectionCount();
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") prevImage();
    if (event.key === "ArrowRight") nextImage();
  });

  loadImages(selectedCategory, 20);
});
