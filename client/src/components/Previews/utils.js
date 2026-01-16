export const getImageSrc = (file) => {
  if (!file) return null;
  return (
    file.thumbUrl ||
    file.url ||
    (file.originFileObj && URL.createObjectURL(file.originFileObj))
  );
};
