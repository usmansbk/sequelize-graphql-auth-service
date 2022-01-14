const picture = (req, res) => {
  const { filename, size, mimetype, path } = req.file;

  res.send({
    success: true,
    file: {
      size,
      path,
      fileName: filename,
      mimeType: mimetype,
    },
  });
};

export default {
  picture,
};
