const picture = (req, res) => {
  console.log(req.body);
  const { filename, size, mimetype, path } = req.file;

  res.send({
    success: true,
    file: {
      fileName: filename,
      size,
      mimeType: mimetype,
      path,
    },
  });
};

export default {
  picture,
};
